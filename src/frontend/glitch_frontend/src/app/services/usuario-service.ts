import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type Usuario = {
  id: string;
  nickname: string;
  dt_criacao: Date;
  ultima_altera_senha: Date | null;
  pessoa: Pessoa | null;
};

export type Pessoa = {
  nome: string;
  sobrenome: string;
  id: string;
  cpf: string;
  dt_nascimento: Date;
  is_ativo: boolean;
  nacionalidade: string;
  telefone: string;
  email: string;
};

export type UsuarioResumo = {
  nickname: string;
  email: string;
  dias_ativo: number;
  idade: number;
  nacionalidade: string;
};

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  

  constructor(private httpClient:HttpClient){}

  private api_url:string = environment.apiURL;

  public getMeusDados():Observable<any>{
    let headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
    return this.httpClient.get(`${this.api_url}/api/usuario/eu`,{headers:headers})
  }

  public getDadosUpdate(): Observable<any> {
    let headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
    return this.httpClient.get(`${this.api_url}/api/usuario/dadosUpdate`,{headers})
  }


  public getUsuarios(nickname?: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    let url = `${this.api_url}/api/usuario/usuarios`;

    if (nickname) {
      url += `?nickname=${encodeURIComponent(nickname)}`;
    }

    return this.httpClient.get(url, { headers });
  }

  public getUsuariosResumido(): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.httpClient.get(`${this.api_url}/api/usuario/resumo`, { headers });
    
  }

  public deleteUsuario(): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.httpClient.delete(`${this.api_url}/api/usuario/delete`, { headers });

  }

  public updateUsuario(dados: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.httpClient.put(`${this.api_url}/api/usuario/update`,dados,{headers})
  }

  public addUsuario(dados:any):Observable<any>{
    return this.httpClient.post(`${this.api_url}/api/usuario/add`,dados)
  }

  public getUsuarioLogado(): Usuario | null {
    let dados = localStorage.getItem('userData');
    if (dados) {
      let objeto = JSON.parse(dados) as Usuario;
      return objeto;
    }
    return null;
  }
}
