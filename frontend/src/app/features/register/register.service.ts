import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private apiUrl = 'http://localhost:4000/api/v1/user/register'; 

  constructor(private http: HttpClient) { }

  
  register(first_name: string, last_name: string, email: string, password: string): Observable<any> {
    const registerData = { first_name: first_name, last_name: last_name, email, password };
    return this.http.post<any>(this.apiUrl, registerData).pipe(
      catchError(this.handleError) 
    );
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
