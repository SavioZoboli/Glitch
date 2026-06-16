import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JogoService {
  constructor(private http: HttpClient) { }

    private api_url:string = environment.apiURL;

  public getJogos(): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
    return this.http.get(`${this.api_url}/api/jogo/jogos`, { headers })
  }

}
