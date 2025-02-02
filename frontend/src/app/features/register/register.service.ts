import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private apiUrl = `${environment.apiUrl}/api/v1/user/register`; 

  constructor(private http: HttpClient) { }

  
  register(first_name: string, last_name: string, email: string, password: string): Observable<any> {
    const registerData = { first_name, last_name, email, password };
    return this.http.post<any>(`${this.apiUrl}`, registerData);
  }
  


}
