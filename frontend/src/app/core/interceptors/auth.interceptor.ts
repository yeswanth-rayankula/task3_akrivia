import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    if(request.url.includes('akv-interns'))
      return next.handle(request);
    
     if(request.url.includes('files'))
        return next.handle(request);
   
    
   

    
    const token = sessionStorage.getItem('authToken');
    let headers = request.headers;
   
    if (token) {
      console.log(token);
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    console.log(headers);
    let encryptedBody = request.body;
    if (encryptedBody) {
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(encryptedBody), '10').toString();
      encryptedBody = { encryptedData: encrypted }; 
    }

   
    const modifiedRequest = request.clone({
      headers,
      body: encryptedBody,
    });

    console.log("Request Intercepted:", modifiedRequest);

   
    return next.handle(modifiedRequest).pipe(
      map((event: HttpEvent<any>) => {
  
        if (event instanceof HttpResponse) {
          if (event.body) {
            const decrypted = CryptoJS.AES.decrypt(event.body, "10").toString(CryptoJS.enc.Utf8);
            if (decrypted) {
              const decryptedBody = JSON.parse(decrypted);
              return event.clone({ body: decryptedBody });
            }
          }
        }
        return event;
      })
    );
  }
}
