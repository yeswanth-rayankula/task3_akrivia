import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/api/v1/user`; 

  constructor(private http: HttpClient) {}


  getInventory(queryParams: { [key: string]: any }): Observable<{ data: { products: any[], totalProducts: number } }> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<{ data: { products: any[], totalProducts: number } }>(`${this.apiUrl}/getProducts?${queryParams.toString()}`);
  }


  getCartItems(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/cart/items`);
  }

  addProduct(productData: any): Promise<any> {
    return this.http.post(`${this.apiUrl}/addProduct`, productData).toPromise();
  }

  getVendors(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/getVendors`);
  }


  getCategories(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/getCategories`);
  }


  decreaseQuantity(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart/decreaseQuantity`, payload);
  }

  increaseQuantity(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart/increaseQuantity`, payload);
  }

  removeFromCart(Cart_ID: string, product_id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/remove/${Cart_ID}?product_id=${product_id}`);
  }

 
  getPresignedUrl(fileName: string, fileType: string): Observable<{ url: string; fileUrl: string }> {
   
    return this.http.get<{ url: string; fileUrl: string }>(`${this.apiUrl}/files/get-presigned-url`, {
      params: { fileName, fileType }
    });
  }
  getPresignedUrl_forget(fileNames: string, fileType: string): Observable<any> {
    const params = { fileNames };
    return this.http.get(`${this.apiUrl}/files/get-presigned-urls-for-get`, { params });
  }
  
  uploadToS3(presignedUrl: string, file: File): Observable<any> {
    return this.http.put(presignedUrl, file, { headers: { 'Content-Type': file.type } });
  }
}
