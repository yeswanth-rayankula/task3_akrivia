// import { Injectable } from '@angular/core';
// import {
//   HttpRequest,
//   HttpHandler,
//   HttpEvent,
//   HttpInterceptor,
//   HttpResponse
// } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import * as CryptoJS from 'crypto-js';
// import { map } from 'rxjs/operators';
// import { HttpClient } from '@angular/common/http';


// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {

//   constructor(private http: HttpClient) {}
//   private tokenEndpoint = 'http://localhost:3000/token';
//   refreshAccessToken(refreshToken: string): Observable<{ accessToken: string }> {
//     return this.http.post<{ accessToken: string }>(this.tokenEndpoint, {
//       token: refreshToken,
//     });
//   }
//   intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
//     if(request.url.includes('akv-interns'))
//       return next.handle(request);
    
//      if(request.url.includes('files'))
//         return next.handle(request);
   
    
   

    
//     const token = sessionStorage.getItem('authToken');
//     let headers = request.headers;
   
//     if (token) 
//     {
//       console.log(token);
//       headers = headers.set('Authorization', `Bearer ${token}`);
//     }
//     else
//     {
//         const refreshToken=sessionStorage.getItem('r_authToken');
//         if(refreshToken)
//         {
//             const x=this.refreshAccessToken(refreshToken);
//             headers = headers.set('Authorization', `Bearer ${x}`);
//         }
//     }
//     console.log(headers);
//     let encryptedBody = request.body;
//     if (encryptedBody) {
//       const encrypted = CryptoJS.AES.encrypt(JSON.stringify(encryptedBody), '19090').toString();
//       encryptedBody = { encryptedData: encrypted }; 
//     }

   
//     const modifiedRequest = request.clone({
//       headers,
//       body: encryptedBody,
//     });

//     console.log("Request Intercepted:", modifiedRequest);

   
//     return next.handle(modifiedRequest).pipe(
//       map((event: HttpEvent<any>) => {
  
//         if (event instanceof HttpResponse) {
//           if (event.body) {
//             const decrypted = CryptoJS.AES.decrypt(event.body, '19090').toString(CryptoJS.enc.Utf8);
//             if (decrypted) {
//               const decryptedBody = JSON.parse(decrypted);
//               return event.clone({ body: decryptedBody });
//             }
//           }
//         }
//         return event;
//       })
//     );
//   }
// }
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { map, catchError, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private http: HttpClient) {}

  private tokenEndpoint = 'http://localhost:3000/token';

  refreshAccessToken(refreshToken: string): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(this.tokenEndpoint, {
      token: refreshToken,
    });
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.includes('akv-interns') || request.url.includes('files')) {
      return next.handle(request);
    }

    const token = sessionStorage.getItem('authToken');
    let headers = request.headers;

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    let encryptedBody = request.body;
    if (encryptedBody) {
        
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(encryptedBody), '19090').toString();
      encryptedBody = { encryptedData: encrypted }; 
    }

    const modifiedRequest = request.clone({
      headers,
      body: encryptedBody,
    });

    return next.handle(modifiedRequest).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          if (event.body) {
            const decrypted = CryptoJS.AES.decrypt(event.body, '19090').toString(CryptoJS.enc.Utf8);
            if (decrypted) {
              const decryptedBody = JSON.parse(decrypted);
              return event.clone({ body: decryptedBody });
            }
          }
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          const refreshToken = sessionStorage.getItem('r_authToken');
          if (refreshToken) {
            return this.refreshAccessToken(refreshToken).pipe(
              switchMap((response) => {
                const newAccessToken = response.accessToken;
                const retryRequest = request.clone({
                  headers: request.headers.set('Authorization', `Bearer ${newAccessToken}`),
                });
                return next.handle(retryRequest);
              })
            );
          } else {
            return throwError(error);
          }
        }
        return throwError(error);
      })
    );
  }
}
