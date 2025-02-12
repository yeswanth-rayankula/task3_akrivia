import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterService } from './register.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-signup',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class SignUpComponent  {
  signupForm: FormGroup;
 
  constructor(private fb: FormBuilder,private registerService: RegisterService, private router: Router,private toastr: ToastrService) {
    this.signupForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
   
    });
  }
  locations: any[] = [];
 
  onSubmit(): void {
    if (this.signupForm.invalid) return;
  
    const { first_name, last_name, email, password } = this.signupForm.value;
  
    this.registerService.register(first_name, last_name, email, password).subscribe({
      next:(data)=>{
        console.log(data);
        this.toastr.success("register successful",'success');
        this.router.navigate(['/login']); 
      },
      error:(err)=>{
        console.log(err);
        this.toastr.error(err.error.error.message,'error');
        
      }
    });
  }
  
  
}

