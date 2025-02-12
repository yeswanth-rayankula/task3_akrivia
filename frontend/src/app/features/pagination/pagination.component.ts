import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx'; 
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from './inventory.service';
import * as pako from 'pako';
import { FileUploadService } from '../file-upload/file-upload-service.service';
import { NavbarService } from '../navbar/navbar.service';
import { from, of, Subject } from 'rxjs';

export interface InventoryItem {
  product_name: string;
  product_image:string;
  status: string;
  category_name: string;
  vendor_name: string;
  quantity_in_stock: number;
  unit_price: number;
  isSelected?: boolean;
  isEditing?: boolean; 
  editedProductName?: string;
  editedStatus?: string;
  editedCategoryName?: string;
  editedVendorName?: string;
  editedQuantity?: number;
  editedUnitPrice?: number;
  previewImage?: string; 
}

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {
  inventoryData: InventoryItem[] = []; 
  subs: Subject<number> = new Subject<number>();
 

  
  productImageUrl:string="";

  cartData: InventoryItem[] = [];
  categories:any=[];
  vendors:any=[];
  currentPage: number = 1; 
  itemsPerPage: number = 5; 
  totalItems: number = 0; 
  totalPages: number = 0; 
  viewMode: 'viewAll' | 'cart' |'import' | 'chat' = 'viewAll'; 
  showModal: boolean = false;
  addProductForm: FormGroup; 
  selectedFile: File | null = null;
  data:any ;
  searchText: string = '';
  isModalOpen = false;
  selectedItems:any=[];
  role:any;
  constructor(private fb: FormBuilder, private http: HttpClient,private navbarService:NavbarService,private inventoryService:InventoryService,private fileUploadService:FileUploadService) {
   
    this.addProductForm = this.fb.group({
      product_name: ['', [Validators.required]],
      category_name: ['', [Validators.required]],
      vendor_name: ['', [Validators.required]],
      quantity_in_stock: [0, [Validators.required, Validators.min(0)]],
      unit_price: [0, [Validators.required, Validators.min(0)]],
     
     
    });
   
    (window as any).changeViewMode = this.changeViewMode.bind(this);
  }
  changeViewMode(mode: 'viewAll' | 'cart' | 'chat' | 'import') {
    console.log(mode);
    this.viewMode = mode;
  }

  isDropdownOpen = false;
  selectedFilters: { [key: string]: boolean } = {};
 

  toggleDropdown() {
    console.log("dh");
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onCheckboxChange(filter: string, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.selectedFilters[filter] = checkbox.checked;
  }

  filterBy(criteria: string) {
    console.log(`Filtering by ${criteria}`);
  
    this.isDropdownOpen = false;
  }

  ngOnInit(): void {
    this.navbarService.getUserById()
    .subscribe(
      (data)=>{console.log(data.role,"page");this.role=data.role},
      (err)=>{console.log(err)}
    )

    this.loadInventory();
    this.loadCategories();
    this.loadVendors();
    this.loadCart();
  }
  loadCart() {
    // console.log(this.searchText);
    // console.log(this.selectedFilters);
    // console.log("hiell");
    this.inventoryService.getCartItems()
      .subscribe({
        next: (response) => {
          console.log("hiell");
          console.log(response.data);
          this.cartData = response.data;
          this.applyFilters();
          console.log('Cart items loaded:', this.cartData);
        },
        error: (err) => {
          console.error('Error loading cart items:', err);
        }
      });
  }
  
  applyFilters() {
    if (this.searchText!="") {
     
      this.cartData = this.cartData.filter(item => {
        return Object.keys(this.selectedFilters).some(column => {
          if (this.selectedFilters[column] && item[column as keyof typeof item]) {
            return (item[column as keyof typeof item] as string)
              .toString()
              .toLowerCase()
              .includes(this.searchText.toLowerCase());
          }
          return false;
        });
      });
    }
   
  }
  
  handleModelChangess() {

    const trimmedSearchText = this.searchText.trim();

    if (this.viewMode === 'viewAll' && trimmedSearchText !== '') {
      console.log('Calling loadInventory()');
      this.loadInventory();
    } else if (this.viewMode === 'cart' && trimmedSearchText !== '') {
      console.log('Calling applyFilters()');
      this.applyFilters();
    } 
  }
  async upload(file:any)
  {
    try {
      const response: any = await this.fileUploadService.getPresignedUrlForUpload(file.name, file.type).toPromise();
      await this.fileUploadService.uploadFileToS3(response.url, file, file.type).toPromise();
      const getUrlResponse: any = await this.inventoryService.getPresignedUrl_forget(file.name, file.type).toPromise();
      const url = getUrlResponse.urls[0].url;
         console.log(url);
       await this.http.post<any>('http://localhost:4000/api/v1/user/imports/add', { url:url,file_name:file.name}).toPromise();
      console.log('POST Response:');
    } catch (err) {
      console.error('Error getting pre-signed URL:', err);
      alert('Failed to upload image. Please try again.');
    }
  }
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    console.log(file.name,file.type);
    if (!file) {
      alert('No file selected.');
      return;
    }
  
    const fileType = file.name.split('.').pop();
    if (fileType !== 'xlsx' && fileType !== 'xls') {
      alert('Invalid file type. Please upload an Excel file.');
      return;
    }
    this.upload(file)
 
  
   
  }
  handleImageUpload(event: any): void {
    const file = event.target.files[0];
    this.getPresignedUrl(file);
  }
  
  adddata() {
    this.data.forEach((data:any) => {
      this.inventoryService.addProduct(data)
        .then((data)=>{
          
          console.log(data);
        })
        .catch((err)=>{
          console.log(err);
        })
    });

  }
  
  loadVendors()
  {
    this.inventoryService.getVendors().subscribe({
      next: (response) => {
        this.vendors = response.data; 
        console.log('vendors loaded:', this.vendors);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        alert('Failed to load categories. Please try again later.');
      }
    });
   
  }
  loadInventory() {
    console.log(this.searchText);
    console.log(this.selectedFilters);
    const queryParams = new URLSearchParams({
    
      page: this.currentPage.toString(),
      offset: this.itemsPerPage.toString(),
      searchText: this.searchText, 
      ...Object.entries(this.selectedFilters) 
        .filter(([, value]) => value) 
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value.toString() }), {}),
    });
  
      this.inventoryService.getInventory(queryParams)
      .subscribe({
        next: (response) => {
          console.log(response.data.products);
          this.inventoryData = response.data.products; 
          this.totalItems = response.data.totalProducts;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        },
        error: (err) => {
          console.error('Error loading inventory:', err);
          alert('Failed to load inventory. Please try again later.');
        },
      });
  }
  
  
  
  
  loadCategories()
  {
    this.inventoryService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.data; 
        console.log('Categories loaded:', this.categories);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        alert('Failed to load categories. Please try again later.');
      }
    });

  }
  

  setViewMode(mode: 'viewAll' | 'cart') {
    this.viewMode = mode;
  }


  toggleEdit(item: InventoryItem): void {
    item.isEditing = true;
    item.editedProductName = item.product_name;
    item.editedStatus = item.status;
    item.editedCategoryName = item.category_name;
    item.editedVendorName = item.vendor_name;
    item.editedQuantity = item.quantity_in_stock;
    item.editedUnitPrice = item.unit_price;
  }
 
saveEdit(item: any): void {
  const updatedProduct = {
    product_name: item.editedProductName,
    status: item.editedStatus,
    category_name: item.editedCategoryName,
    vendor_name: item.editedVendorName,
    quantity_in_stock: item.editedQuantity,
    unit_price: item.editedUnitPrice,
    product_image: item.product_image,
  };
  console.log(updatedProduct);
  this.http.put(`http://localhost:4000/api/v1/user/editProduct/${item.product_id}`, updatedProduct).subscribe(
    (response) => {
    
      this.loadInventory();
    },
    (error) => {
      console.error('Error saving edit:', error);
    }
  );
}
validatePositiveNumber(item: any): void {
  if (item.editedQuantity < 0) {
   
    alert('Only positive numbers are allowed.');
    item.editedQuantity = 0; 
  }
}


  cancelEdit(item: InventoryItem): void {
    item.editedProductName = item.product_name;
    item.editedStatus = item.status;
    item.editedCategoryName = item.category_name;
    item.editedVendorName = item.vendor_name;
    item.editedQuantity = item.quantity_in_stock;
    item.editedUnitPrice = item.unit_price;
    item.isEditing = false;
  }

  downloadSelectedItems() {
    const selectedItems = this.inventoryData.filter(item => item.isSelected);
    if (selectedItems.length === 0) {
      alert('No items selected for download');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(selectedItems, {
      header: ['product_name', 'category_name', 'quantity_in_stock', 'unit_price', 'status', 'vendor_name']
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, 'selected_inventory.xlsx');
  }
 
  moveToCart() {
   
    this.selectedItems = this.inventoryData
      .filter(item => item.isSelected)
      .map(item => ({ ...item, quantity_in_stock: 0 }));
  
   
    if (this.selectedItems.length === 0) {
      alert('No items selected to move to the cart');
      return;
    }
  
   
    this.isModalOpen = true;
    console.log('Selected Items with Reset Quantities:', this.selectedItems);
  }
  
  
  
  
deleteItem(item: any): void {
  this.http.delete(`http://localhost:4000/api/v1/user/deleteProduct/${item.product_id}`).subscribe(
    (response) => {
     
      this.loadInventory();
    },
    (error) => {
      console.error('Error deleting item:', error);
    }
  );
}


  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadInventory();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadInventory();
    }
  }
  selectAll(event: any): void {
    const isChecked = event.target.checked;
    this.inventoryData.forEach(item => item.isSelected = isChecked);
  }
  decreaseQuantity(item:any) {
    console.log(item);
    if (item.quantity_in_stock > 0) {
      const payload = {
        cartId: item.Cart_ID,
        productId: item.product_id, 
      };
      console.log(payload);
      this.inventoryService.decreaseQuantity(payload)
        .subscribe({
          next: (response: any) => {
            this.loadInventory();
            console.log('Quantity decreased successfully:', response);
            item.quantity_in_stock--; // Update UI to reflect the new quantity
          },
          error: (err) => {
            console.error('Error decreasing quantity:', err);
            alert('Failed to decrease quantity');
          }
        });
    } else {
      alert('Quantity cannot be less than 0');
    }
  }
  

  increaseQuantity(item: any) {
    console.log(item);
  
      const payload = {
        cartId: item.Cart_ID,
        productId: item.product_id, // Ensure product_id is passed
      };
      console.log(payload);
      this.http.post('http://localhost:4000/api/v1/user/cart/increaseQuantity', payload)
        .subscribe({
          next: (response: any) => {
            this.loadInventory();
            console.log('Quantity increased successfully:', response);
            item.quantity_in_stock++; // Update UI to reflect the new quantity
          },
          error: (err) => {
            console.error('Error decreasing quantity:', err);
            alert('Failed to decrease quantity');
          }
        });
      this.loadInventory();
  }

  // Remove the item from the cart
  removeFromCart(item: any) {
    console.log(item);
    const Cart_ID = item.Cart_ID;
    const product_id=item.product_id; 
    this.http.delete(`http://localhost:4000/api/v1/user/cart/remove/${Cart_ID}?product_id=${product_id}`).subscribe({
      next: (response) => {
        console.log(response);
  
        
        this.loadCart();
      },
      error: (error) => {
        console.error('Error removing item:', error);
      },
    });
    this.loadInventory();
  }
  
  
  openAddProductModal() {
    this.showModal = true;
    this.addProductForm.reset({
      product_name: '',
      category_id: '',
      vendor_id: '',
      quantity_in_stock: 0,
      unit_price: 0,
      status: 1
    }); 
  }

 
  closeModal() {
    this.showModal = false;
  }
 



  getPresignedUrl(file: File) {
    const fileName = file.name;
    const fileType =file.type;
    console.log(fileName);
    console.log(fileType);
    this.http
      .get<{ url: string; fileUrl: string }>(
        `http://localhost:4000/api/v1/user/files/get-presigned-url`,{
          params: { fileName, fileType },
        }
      )
      .subscribe({
        next: (response) => {
          const { url } = response;

           console.log(url,file,file.type);
           this.fileUploadService
           .uploadFileToS3(url, file, fileType)
           .subscribe(
             () => {
                this.fileUploadService.getPresignedUrlsForDownload([fileName])
                .subscribe((data)=>
                {
                  console.log(data);
                  this.productImageUrl=data.urls[0].url;
                })
               console.log('File uploaded successfully to S3!');
              
             },
             (error) => {
               console.error('Error uploading file:', error);
             }
           );
         
        },
        error: (err) => {
          console.error('Error getting pre-signed URL:', err);
          alert('Failed to upload image. Please try again.');
        }
      });
  }


 
  uploadToS3(url: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      this.http.put(url, formData, { headers: { 'Content-Type': file.type } }).subscribe({
        next: () => {
          console.log('File uploaded successfully');
           this.fileUploadService.getPresignedUrlsForDownload([file.name]).subscribe((data)=>{
            console.log(data.urls[0].url);
            this.productImageUrl=data.urls[0].url;
           })
         
          resolve();
        },
        error: (error) => {
          console.error('Error uploading file:', error);
          alert('There was an error uploading the file.');
          reject(error);
        }
      });
    });
  }


  onSubmit() {
    console.log(this.addProductForm.value);

    if (this.addProductForm.valid && this.productImageUrl) {
      const productData = {
        ...this.addProductForm.value,
        product_image: this.productImageUrl 
      };


      this.http.post('http://localhost:4000/api/v1/user/addProduct', productData).subscribe({
        next: () => {
          console.log('Product added successfully');
          this.loadInventory();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error adding product:', err);
        }
      });
    } else {
      alert('Please fill out all required fields and upload an image.');
    }
  }

  downloadItem(item: any): void {
   
    let content = '';
    
  
    for (const [key, value] of Object.entries(item)) {
      content += `${key}: ${value}\n`; 
    }
  
 
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `item.txt`; 
    link.click();
  }
  closesModal()
   {
        this.isModalOpen=false;
   }
   incQuantity(item:any)
   {
      item.quantity_in_stock++;
   }
   decQuantity(item:any)
   {
      if(item.quantity_in_stock<=0)
        alert("not possible");
      else
      item.quantity_in_stock--;
   }
   save(selectedItems:any)
   {
    
    this.http.post('http://localhost:4000/api/v1/user/cart/addItems', this.selectedItems)
      .subscribe({
        next: (response) => {
          console.log('Items added to the cart successfully:', response);
          this.closeModal();
          this.loadCart();
          console.log("dfgh");
          this.loadInventory();
          alert('Items moved to the cart successfully!');
        },
        error: (err) => {
          console.error('Error moving items to the cart:', err);
          alert('Failed to move items to the cart. Please try again.');
        },
      });

      this.closesModal();
     
    
   }
   onImageEdit(event: any, item: InventoryItem): void {
    const file = event.target.files[0];
    if (file) {
    
      const reader = new FileReader();
      reader.onload = () => {
        item.previewImage = reader.result as string; 
      };
      reader.readAsDataURL(file);
  
   
      const fileName = file.name;
      const fileType = file.type;
  
      this.http
        .get<{ url: string; fileUrl: string }>(
          `http://localhost:4000/api/v1/user/files/get-presigned-url`,
          { params: { fileName, fileType } }
        )
        .subscribe({
          next: (response) => {
            const presignedUrl = response.url;
            this.uploadEditedImage(presignedUrl, file, item);
          },
          error: (err) => {
            console.error('Error getting pre-signed URL for editing:', err);
            alert('Failed to upload image. Please try again.');
          },
        });
    }
  }
  
  uploadEditedImage(presignedUrl: string, file: File, item: InventoryItem): void {
    this.http
      .put(presignedUrl, file, { headers: { 'Content-Type': file.type } })
      .subscribe({
        next: () => {
          const objectKey = `${file.name}`;
          this.http
            .get<{ urls: { url: string }[] }>(
              `http://localhost:4000/api/v1/user/files/get-presigned-urls-for-get`,
              { params: { fileNames: objectKey } }
            )
            .subscribe({
              next: (response) => {
                const getUrl = response.urls[0].url; 
                this.productImageUrl= getUrl; 
              console.log(this.productImageUrl);
                alert('Image updated successfully!');
              },
              error: (err) => {
                console.error('Error getting access URL for edited image:', err);
              },
            });
        },
        error: (err) => {
          console.error('Error uploading edited image to S3:', err);
          alert('Failed to upload image. Please try again.');
        },
      });
  }
  

}

