import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type Usuario = {
  id: string;
  nickname: string;
  aboutMe?: string | null;
  avatarUrl?: string | null;
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
  avatarUrl?: string | null;
  avatar_url?: string | null;
};

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  constructor(private httpClient:HttpClient){}

  private api_url:string = environment.apiURL;
  readonly avatarPadraoUrl = '/imgs/photo-profile-default.png';
  private readonly usuarioLogadoSubject = new BehaviorSubject<any>(
    this.lerUsuarioLocal(),
  );
  readonly usuarioLogado$ = this.usuarioLogadoSubject.asObservable();

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

  public uploadAvatar(
    arquivo: File,
    tokenOverride?: string,
  ): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', arquivo);

    const token = tokenOverride ?? localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.httpClient.post(`${this.api_url}/api/usuario/avatar`, formData, {
      headers,
    });
  }

  public resolverUrlAvatar(
    avatarUrl: string | null | undefined,
  ): string | null {
    const url = String(avatarUrl ?? '').trim();
    if (!url) return null;

    if (/^https?:\/\//i.test(url)) return url;

    const baseApi = this.api_url.replace(/\/+$/, '');
    if (url.startsWith('/')) {
      return `${baseApi}${url}`;
    }

    return `${baseApi}/${url}`;
  }

  public obterAvatarComFallback(
    avatarUrl: string | null | undefined,
    fallback: string = this.avatarPadraoUrl,
  ): string {
    return this.resolverUrlAvatar(avatarUrl) ?? fallback;
  }

  public getUsuarioLogado(): Usuario | null {
    return this.lerUsuarioLocal() as Usuario | null;
  }

  public atualizarUsuarioLocal(dados: any, sobrescrever: boolean = false): void {
    const payload = dados ?? null;
    if (!payload) {
      localStorage.removeItem('userData');
      this.usuarioLogadoSubject.next(null);
      return;
    }

    const usuarioAtual = sobrescrever
      ? payload
      : {
          ...(this.lerUsuarioLocal() ?? {}),
          ...payload,
        };

    localStorage.setItem('userData', JSON.stringify(usuarioAtual));
    this.usuarioLogadoSubject.next(usuarioAtual);
  }

  public limparUsuarioLocal(): void {
    localStorage.removeItem('userData');
    this.usuarioLogadoSubject.next(null);
  }

  private lerUsuarioLocal(): any | null {
    try {
      const dados = localStorage.getItem('userData');
      if (!dados) return null;
      return JSON.parse(dados);
    } catch {
      return null;
    }
  }
}
