import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  private apiUrl = `${environment.apiUrl}/api/v1/user/getData`;
  private updateUserUrl = `${environment.apiUrl}/api/v1/user/updateUser`; // Update this URL to match your backend route

  constructor(private http: HttpClient) {}

  getUserById(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  updateUserProfilePic(userId: string, updatedData: any): Observable<any> {
    console.log(updatedData);
    return this.http.patch(`${this.updateUserUrl}`, updatedData);
  }
}
