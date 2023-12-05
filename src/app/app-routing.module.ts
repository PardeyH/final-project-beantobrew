import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {AboutComponent} from "./about/about.component";
import {LoginComponent} from "./login/login.component";
import {RegisterComponent} from "./register/register.component";
import {LevelComponent} from "./level/level.component";
import {ScoreComponent} from "./score/score.component";
import {CarComponent} from "./car/car.component";

const routes: Routes = [
  {path : "", component: HomeComponent},
  {path : "about", component: AboutComponent},
  {path : "login", component: LoginComponent},
  {path : "logout", redirectTo: "/login", pathMatch: "full"},
  {path : "register", component: RegisterComponent},
  {path : "level", component: LevelComponent},
  {path : "score", component: ScoreComponent},
  {path : "car", component: CarComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
