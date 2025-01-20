import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterService } from './register.service';


@Component({
  selector: 'app-signup',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class SignUpComponent  {
  signupForm: FormGroup;

  constructor(private fb: FormBuilder,private registerService: RegisterService, private router: Router) {
    this.signupForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if (this.signupForm.invalid) return;
    console.log(this.signupForm.value);
    const { first_name, last_name, email, password } = this.signupForm.value;
    this.registerService.register(first_name, last_name, email, password).subscribe(
      (response) => {
        this.router.navigate(['/login']); 
      },
      (error) => {
        console.error('Registration failed', error);
      }
    );}
}

