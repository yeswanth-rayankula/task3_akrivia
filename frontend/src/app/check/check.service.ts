import { Injectable } from '@angular/core';
import { AppModule } from '../app.module';
import { HttpClient } from '@angular/common/http';
import { text } from 'stream/consumers';

@Injectable()
export class CheckService {
  m:string="";
  constructor(private ht:HttpClient) {
    console.log("nio")
      this.ht.get('http://localhost:4000/x',{responseType:'text'}).subscribe((data)=>console.log("ni",data));
  }
  solve()
  {
    console.log("den");
  }
}
