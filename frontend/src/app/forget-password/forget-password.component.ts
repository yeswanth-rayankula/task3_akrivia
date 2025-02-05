import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent  {

  forgotPasswordForm: FormGroup;
  message: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.http.post('http://localhost:4000/forgot-password', this.forgotPasswordForm.value).subscribe(
        (res: any) => {this.message = res.message; },
        (err) => (this.message = err.error.message)
      );
    }
  }

}
