import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = 'http://localhost:4000/api/v1/user/login'; 

  constructor(private http: HttpClient) { }

  
  login(identifier: string, password: string): Observable<any> {
    const loginData = { identifier, password };
    return this.http.post<any>(this.apiUrl, loginData);
  }

  
  storeToken(token: string): void {
    sessionStorage.setItem('authToken', token); 
  }

  r_storeToken(token: string): void {
    sessionStorage.setItem('r_authToken', token); 
  }
 
 

  
    
}
