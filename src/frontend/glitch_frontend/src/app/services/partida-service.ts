import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PartidaService {
  
  constructor(private http:HttpClient){}

  public computarMorte(vitima:string,culpado:string,partida:string):Observable<any>{
    const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    return this.http.post('http://localhost:3000/api/partida/computarMorte',{vitima,culpado,partida},{headers})
  }


  public buscarLogs(partida:string):Observable<any>{
    const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    return this.http.get(`http://localhost:3000/api/partida/logs/${partida}`,{headers})
  }

  public alterarPlacar(jogador:string,chave:string,novaPontuacao:number):Observable<any>{
    const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    return this.http.put(`http://localhost:3000/api/partida/alteraPontuacao`,{jogador,chave,novaPontuacao},{headers})
  }

  public iniciarPartida(partida:string):Observable<any>{
    const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    return this.http.put(`http://localhost:3000/api/partida/iniciarPartida`,{partida},{headers})
  }

  public finalizarPartida(etapa:string,partida:string,chaveamento:string,vencedor:string):Observable<any>{
    const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    return this.http.put(`http://localhost:3000/api/partida/finalizarPartida`,{partida,etapa,chaveamento,vencedor},{headers})
  }

  public finalizarEtapa(etapa:string):Observable<any>{
    const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    return this.http.put(`http://localhost:3000/api/partida/finalizarEtapa`,{etapa},{headers})
  }

}
