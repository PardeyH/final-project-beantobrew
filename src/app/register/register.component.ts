import { Component } from '@angular/core';
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  credentials : { username: string, password: string } = {
    username: '',
    password: ''
  };
  info?: any;
  confirmPassword = '';

  constructor(private authService : AuthService, private router: Router) {
  }

  passwordsMatch: boolean = true;

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  register() {

    console.log("Registering user...");
    // console.log("Username:", this.credentials.username);
    // console.log("Password:", this.credentials.password);
    // console.log("Confirm Password:", this.confirmPassword);

    if (!this.credentials.password) {
      this.info = "Please enter a password";
      this.passwordsMatch = false;
      return;
    }
    if (this.credentials.password !== this.confirmPassword) {
      this.info = "Passwords do not match";
      this.passwordsMatch = false;
      return;
    }
    this.authService.register(this.credentials).subscribe(
      {
        next: result => {
          this.info = "Registered Successfully";
          setTimeout(() => {
            this.router.navigate(["/login"]);
          }, 2000);
        },
        error: err => {
          this.info = err.error;
        }
      }
    );
  }
}
