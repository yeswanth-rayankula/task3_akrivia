import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  private apiUrl = `http://localhost:4000/api/v1/user/getData`;
  private updateUserUrl = `http://localhost:4000/api/v1/user/updateUser`; // Update this URL to match your backend route

  constructor(private http: HttpClient) {}

  getUserById(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  updateUserProfilePic(userId: string, updatedData: any): Observable<any> {
    console.log(updatedData);
    return this.http.patch(`${this.updateUserUrl}`, updatedData);
  }
}
