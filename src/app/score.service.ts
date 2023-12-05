import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {

  private apiUrl  =  environment.baseUrl + '/scores/score'
  constructor(private http: HttpClient) { }

  sendScore(score: number): Observable<any> {

    return this.http.post(`${this.apiUrl}/save-score`, { score });  }

  getHighScore(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/get-highscore`);
  }

  getTotalScore(userName: string): Observable<{totalScore: number; message: string}> {
    return this.http.get<{ totalScore: number; message: string }>(`${this.apiUrl}/total-score/${userName}`);
  }

  getDummyTotalScore(userName: string): Observable<{
    userName: string;
    totalScore: number; message: string; image: string }> {

    return this.http.get<{ totalScore: number; message: string; image: string; userName: string }>(`${this.apiUrl}${userName}`);
  }

}
