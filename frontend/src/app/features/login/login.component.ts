import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from './login.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

 export class LoginComponent {
  loginForm: FormGroup;
  // asta: FormGroup;

  constructor(private fb: FormBuilder, private loginService: LoginService, private router: Router,private toastr: ToastrService) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
 
  }
  
  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const { identifier, password } = this.loginForm.value;
    this.loginService.login(identifier, password).subscribe(
      (response) => {
        console.log(response.rtoken);
        this.loginService.storeToken(response.token);
        this.loginService.r_storeToken(response.rtoken);
        this.toastr.success("login successful",'success');
        this.router.navigate(['/dashboard']); 

      },
      (err) => {
        this.toastr.error(err.error.error.message,'error');
      }
    );
  }
}