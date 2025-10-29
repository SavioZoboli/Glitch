import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EquipeService {
  
  constructor(private httpClient:HttpClient){}

  public addEquipe(nome:string):Observable<any>{
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
    return this.httpClient.post(`http://localhost:3000/api/equipe/add`,{nome},{headers})
  }

  public convidarJogador(equipe:string,nickname:string):Observable<any>{
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
    return this.httpClient.post('http://localhost:3000/api/equipe/invite',{equipe,nickname},{headers})
  }

}
