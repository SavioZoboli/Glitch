import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type Usuario = {
  id:string;
  nickname:string;
  dt_criacao:Date;
  ultima_altera_senha:Date|null;
  pessoa:Pessoa|null
}

export type Pessoa = {
  nome:string;
  sobrenome:string;
  id:string;
  cpf:string;
  dt_nascimento:Date;
  is_ativo:boolean;
  nacionalidade:string;
  telefone:string;
  email:string;
}

export type UsuarioResumo = {
  nickname:string;
  email:string;
  dias_ativo:number;
  idade:number;
  nacionalidade:string;
}


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  

  constructor(private httpClient:HttpClient){}

  public getMeusDados():Observable<any>{
    let headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
    return this.httpClient.get(`http://localhost:3000/api/usuario/eu`,{headers:headers})
  }

  public getDadosUpdate():Observable<any>{
    let headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
    return this.httpClient.get('http://localhost:3000/api/usuario/dadosUpdate',{headers})
  }


  public getUsuarios(): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };

    return this.httpClient.get(`http://localhost:3000/api/usuario/usuarios`, { headers });
    
  }

  public getUsuariosResumido(): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };

    return this.httpClient.get(`http://localhost:3000/api/usuario/resumo`, { headers });
    
  }


  public deleteUsuario(): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };

    return this.httpClient.delete(`http://localhost:3000/api/usuario/delete`, { headers });

  }

  public updateUsuario(dados:any):Observable<any>{
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
    return this.httpClient.put('http://localhost:3000/api/usuario/update',dados,{headers})
  }

  public addUsuario(dados:any):Observable<any>{
    return this.httpClient.post('http://localhost:3000/api/usuario/add',dados)
  }

}