import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PartidaService {
  
  constructor(private http:HttpClient){}

    private api_url:string = environment.apiURL;

  public computarMorte(vitima:string,culpado:string,partida:string):Observable<any>{
    const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    return this.http.post(`${this.api_url}/api/partida/computarMorte`,{vitima,culpado,partida},{headers})
  }


  public buscarLogs(partida:string):Observable<any>{
    const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    return this.http.get(`${this.api_url}/api/partida/logs/${partida}`,{headers})
  }

  public alterarPlacar(jogador:string,chave:string,novaPontuacao:number):Observable<any>{
    const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    return this.http.put(`${this.api_url}/api/partida/alteraPontuacao`,{jogador,chave,novaPontuacao},{headers})
  }

  public iniciarPartida(partida:string):Observable<any>{
    const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    return this.http.put(`${this.api_url}/api/partida/iniciarPartida`,{partida},{headers})
  }

  public finalizarPartida(etapa:string,partida:string,chaveamento:string,vencedor:string):Observable<any>{
    const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    return this.http.put(`${this.api_url}/api/partida/finalizarPartida`,{partida,etapa,chaveamento,vencedor},{headers})
  }

  public finalizarEtapa(etapa:string):Observable<any>{
    const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    return this.http.put(`${this.api_url}/api/partida/finalizarEtapa`,{etapa},{headers})
  }

}
