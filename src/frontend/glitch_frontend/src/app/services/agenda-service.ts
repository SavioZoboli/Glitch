import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type NotificacaoAgenda = {
  id: string;
  tipo_alerta: 'DIA_09H' | 'ANTES_5MIN';
  titulo: string;
  mensagem: string;
  dt_evento: string;
  is_lida: boolean;
  dt_lida?: string | null;
  dt_criacao: string;
  papel?: 'ORGANIZADOR' | 'INSCRITO' | 'ESPECTADOR' | null;
  origem?: {
    tipo?: string | null;
    id?: string | null;
  };
};

export type PapelAgenda = 'ORGANIZADOR' | 'INSCRITO' | 'ESPECTADOR';

export type CompromissoAgenda = {
  evento_id: string;
  papel: PapelAgenda;
  fonte: 'AUTO' | 'MANUAL' | string;
  dt_adicionado?: string | Date | null;
  evento: {
    id: string;
    titulo: string;
    descricao?: string | null;
    inicio: string | Date;
    fim?: string | Date | null;
    status?: 'ATIVO' | 'CONCLUIDO' | 'CANCELADO' | string;
    origem?: {
      tipo?: string | null;
      id?: string | null;
    };
  };
};

@Injectable({
  providedIn: 'root',
})
export class AgendaService {
  private api_url: string = environment.apiURL;

  constructor(private http: HttpClient) {}

  getMeusCompromissos(): Observable<CompromissoAgenda[]> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    };

    const params = {
      _ts: String(Date.now()),
    };

    return this.http.get<CompromissoAgenda[]>(
      `${this.api_url}/api/agenda/compromissos`,
      {
        headers,
        params,
      },
    );
  }

  getMinhasNotificacoes(
    apenasNaoLidas: boolean = true,
    limite: number = 20,
  ): Observable<NotificacaoAgenda[]> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    };

    const params = {
      apenasNaoLidas: String(apenasNaoLidas),
      limite: String(limite),
      _ts: String(Date.now()),
    };

    return this.http.get<NotificacaoAgenda[]>(
      `${this.api_url}/api/agenda/notificacoes`,
      {
        headers,
        params,
      },
    );
  }

  marcarNotificacaoComoLida(id: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.put(
      `${this.api_url}/api/agenda/notificacoes/${id}/lida`,
      {},
      { headers },
    );
  }
}
