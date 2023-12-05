import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from "../../environments/environment";
import {Router} from "@angular/router"
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.css']
})
export class ScoreComponent implements OnInit {
  private apiUrl  =  environment.baseUrl + '/totalscore'


  userName?: string;
  message1?: string;
  message2?: string;
  message3?: string;
  message4?: string;
  message5?: string;

  image?: string;
  imageUrl?: string;


  constructor(private http: HttpClient,private authService: AuthService, private router: Router ) { }

  ngOnInit(): void {

    const userName = this.authService.getUsername();

    if (userName) {

      this.http.get<any>(`${this.apiUrl}/${userName}`).subscribe(response => {
        this.userName = response.userName;
        this.message1 = response.message1;
        this.message2 = response.message2;
        this.message3 = response.message3;
        this.message4 = response.message4;
        this.message5 = response.message5;
        this.image = response.image;
        this.imageUrl = environment.baseUrl + this.image;
      });
    } else {

      console.error('Benutzername nicht verfügbar');
    }
  }

  navigateToHomepage() {
    const homepageUrl = '/';
    this.router.navigate([homepageUrl]).then((navResult: boolean) => {
      if (navResult) {
        console.log('Navigation erfolgreich');
      } else {
        console.error('Navigation fehlgeschlagen');
      }
    });
  }

}
