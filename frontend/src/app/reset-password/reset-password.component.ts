import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls:['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
    resetForm: FormGroup;
    message = '';
    token = '';

    constructor(private fb: FormBuilder, private http: HttpClient, private route: ActivatedRoute, private router: Router) {
        this.resetForm = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    ngOnInit() {

        this.token = this.route.snapshot.queryParamMap.get('token') || '';
        console.log(this.token, "token");
    }

    submit() {
     
        this.http.post(`http://localhost:4000/reset-password`,{ password:this.resetForm.value , token:this.token})
            .subscribe(
                res => {
                    this.message = 'Password reset successful!';
                    this.router.navigate(['/login']);
                },
                err => this.message = 'Error resetting password'
            );
    }
}
