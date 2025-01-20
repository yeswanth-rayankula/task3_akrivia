import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx'; // Import XLSX library for Excel

export interface InventoryItem {
  product_name: string;
  status: string;
  category_name: string;
  vendor_name: string;
  quantity_in_stock: number;
  unit_price: number;
  isSelected?: boolean;
  isEditing?: boolean; // To track if the row is in edit mode
  editedProductName?: string;
  editedStatus?: string;
  editedCategoryName?: string;
  editedVendorName?: string;
  editedQuantity?: number;
  editedUnitPrice?: number;
}

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {

  inventoryData: InventoryItem[] = []; // Store inventory data locally
  cartData: InventoryItem[] = [];
  currentPage: number = 1; // Current page number
  itemsPerPage: number = 5; // Items per page
  totalItems: number = 0; // Total number of items
  totalPages: number = 0; // Total number of pages
  viewMode: 'viewAll' | 'cart' = 'viewAll'; // Default view mode

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadInventory();
  }

  // Fetch data from API and load it
  loadInventory() {
    this.http
    .get<{ data: { products: InventoryItem[]; totalProducts: number } }>(
      `http://localhost:4000/api/v1/user/getProducts?page=${this.currentPage}&offset=${this.itemsPerPage}`
    )
    .subscribe({
      next: (response) => {
        console.log(response);
        this.inventoryData = response.data.products; // Access products inside the data object
        this.totalItems = response.data.totalProducts; // Access totalProducts inside the data object
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      },
      error: (err) => {
        console.error('Error loading inventory:', err);
        alert('Failed to load inventory. Please try again later.');
      },
    });
  
  
  }
  

  // Set the view mode (either 'viewAll' or 'cart')
  setViewMode(mode: 'viewAll' | 'cart') {
    this.viewMode = mode;
  }

  // Toggle edit mode for an item
  toggleEdit(item: InventoryItem): void {
    item.isEditing = true;

    // Copy the original values to the edited fields
    item.editedProductName = item.product_name;
    item.editedStatus = item.status;
    item.editedCategoryName = item.category_name;
    item.editedVendorName = item.vendor_name;
    item.editedQuantity = item.quantity_in_stock;
    item.editedUnitPrice = item.unit_price;
  }

  // Save edited values
  // pagination.component.ts
saveEdit(item: any): void {
  const updatedProduct = {
    product_name: item.editedProductName,
    status: item.editedStatus,
    category_name: item.editedCategoryName,
    vendor_name: item.editedVendorName,
    quantity_in_stock: item.editedQuantity,
    unit_price: item.editedUnitPrice,
  };

  this.http.put(`http://localhost:4000/api/v1/user/editProduct/${item.product_id}`, updatedProduct).subscribe(
    (response) => {
    
      this.loadInventory();
    },
    (error) => {
      console.error('Error saving edit:', error);
    }
  );
}


  // Cancel editing and revert changes
  cancelEdit(item: InventoryItem): void {
    item.editedProductName = item.product_name;
    item.editedStatus = item.status;
    item.editedCategoryName = item.category_name;
    item.editedVendorName = item.vendor_name;
    item.editedQuantity = item.quantity_in_stock;
    item.editedUnitPrice = item.unit_price;
    item.isEditing = false;
  }

  // Download selected items as an Excel file
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
   
    const selectedItems = this.inventoryData.filter(item => item.isSelected);
  
    if (selectedItems.length === 0) {
      alert('No items selected to move to the cart');
      return;
    }

    this.cartData.push(...selectedItems);
   
    selectedItems.forEach(item => item.isSelected = false);
  
    console.log('Items moved to cart:', this.cartData);
  }
  
deleteItem(item: any): void {
  this.http.delete(`http://localhost:4000/api/v1/user/deleteProduct/${item.product_id}`).subscribe(
    (response) => {
      // Remove the item from the inventoryData array on success
      this.loadInventory();
    },
    (error) => {
      console.error('Error deleting item:', error);
    }
  );
}


  // Pagination controls
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
  decreaseQuantity(item: InventoryItem) {
    if (item.quantity_in_stock > 0) {
      item.quantity_in_stock--;
    } else {
      alert('Quantity cannot be less than 0');
    }
  }
  

  increaseQuantity(item: InventoryItem) {
    item.quantity_in_stock++;
  }

  // Remove the item from the cart
  removeFromCart(item: InventoryItem) {
    const index = this.cartData.indexOf(item);
    if (index > -1) {
      this.cartData.splice(index, 1);
  }
  }
}
