import { Component } from '@angular/core';
import {Greeting, GreetingService} from "../greeting.service";
import {AuthService} from "../auth.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  greeting ? : Greeting;
  greetingUser ?: Greeting;
  info ? : any;

  constructor(public authService : AuthService, private router: Router) {
  }

  logoutAndRedirect() {
    this.authService.postLogout().subscribe(() => {
      // Redirect to the homepage
      this.router.navigate(['/home']);
    });
  }

  protected readonly AuthService = AuthService;
}
