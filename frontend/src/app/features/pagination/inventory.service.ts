import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = 'http://localhost:4000/api/v1/user'; 

  constructor(private http: HttpClient) {}


  getInventory(queryParams: { [key: string]: any }): Observable<{ data: { products: any[], totalProducts: number } }> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<{ data: { products: any[], totalProducts: number } }>(`${this.apiUrl}/getProducts?${queryParams.toString()}`);
  }

  // Get Cart data
  getCartItems(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/cart/items`);
  }

  // Add product to the inventory
  addProduct(productData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/addProduct`, productData);
  }

  // Get Vendors
  getVendors(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/getVendors`);
  }

  // Get Categories
  getCategories(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/getCategories`);
  }

  // Decrease quantity in the cart
  decreaseQuantity(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart/decreaseQuantity`, payload);
  }

  // Increase quantity in the cart
  increaseQuantity(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart/increaseQuantity`, payload);
  }

  // Remove item from cart
  removeFromCart(Cart_ID: string, product_id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/remove/${Cart_ID}?product_id=${product_id}`);
  }

  // Upload file to S3
  getPresignedUrl(fileName: string, fileType: string): Observable<{ url: string; fileUrl: string }> {
    return this.http.get<{ url: string; fileUrl: string }>(`${this.apiUrl}/files/get-presigned-url`, {
      params: { fileName, fileType }
    });
  }

  // Upload image to S3
  uploadToS3(presignedUrl: string, file: File): Observable<any> {
    return this.http.put(presignedUrl, file, { headers: { 'Content-Type': file.type } });
  }
}
