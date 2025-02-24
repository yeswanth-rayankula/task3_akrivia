import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckService } from './check.service';

@Component({
  selector: 'app-check',
  templateUrl: './check.component.html',
  styleUrls: ['./check.component.scss'],
  providers:[CheckService]
})
export class CheckComponent implements OnInit {

  loginFrom!:FormGroup;
  
  constructor(private fb: FormBuilder,private cs:CheckService) {}

  ngOnInit(): void {
    this.cs.solve();
    this.loginFrom=this.fb.group({
      identifier:['',[Validators.required]]
    })
   
  }
  onSubmit()
  { 

    console.log(this.loginFrom.value);
  }
  
 
}
