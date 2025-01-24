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
    return this.http.post<any>(this.apiUrl, loginData).pipe(
      catchError(this.handleError)  
    );
  }

  
  storeToken(token: string): void {
    sessionStorage.setItem('authToken', token); 
  }

 
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
   
      errorMessage = `Error: ${error.error.message}`;
    } else {
      
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }

  
    
}
