import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface PaginacaoResposta {
  pagina_atual: number;
  itens_por_pagina: number;
  total_itens: number;
  total_paginas: number;
  tem_proxima_pagina: boolean;
  tem_pagina_anterior: boolean;
}

export interface RespostaPaginada<T> {
  dados: T[];
  paginacao: PaginacaoResposta;
}

export interface PartidaJogadorResumo {
  id_chaveamento: string;
  torneio: {
    id: string | null;
    nome: string;
    jogo: string;
    finalizado: boolean;
  };
  etapa: string;
  data_partida: string | null;
  adversario: string;
  placar: string;
  resultado: 'VITÓRIA' | 'DERROTA';
}
@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  getTournaments(): Observable<any[]> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http
      .get<any>('http://localhost:3000/api/torneio/torneios', {
        headers,
      })
      .pipe(map((res: any) => (Array.isArray(res) ? res : (res?.dados ?? []))));
  }

  getTournamentsPaginated(page: number = 1): Observable<RespostaPaginada<any>> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http
      .get<any>('http://localhost:3000/api/torneio/torneios', {
        headers,
        params: { page: String(page) },
      })
      .pipe(
        map((res: any) => {
          const dados = Array.isArray(res?.dados)
            ? res.dados
            : Array.isArray(res)
              ? res
              : [];

          const paginacao: PaginacaoResposta = {
            pagina_atual: Number(res?.paginacao?.pagina_atual ?? page) || 1,
            itens_por_pagina: Number(res?.paginacao?.itens_por_pagina ?? 10) ||
              10,
            total_itens: Number(res?.paginacao?.total_itens ?? dados.length) ||
              0,
            total_paginas: Number(res?.paginacao?.total_paginas ?? 0) || 0,
            tem_proxima_pagina: !!res?.paginacao?.tem_proxima_pagina,
            tem_pagina_anterior: !!res?.paginacao?.tem_pagina_anterior,
          };

          return { dados, paginacao };
        }),
      );
  }

  constructor(private http: HttpClient) {}

  addTournament(t: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.post('http://localhost:3000/api/torneio/adicionar', t, {
      headers,
    });
  }

  updateTournament(t: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.put('http://localhost:3000/api/torneio/update', t, {
      headers,
    });
  }

  removeTorneio(id: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.delete(`http://localhost:3000/api/torneio/remove/${id}`, {
      headers,
    });
  }

  getTorneioById(id: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get(`http://localhost:3000/api/torneio/torneio/${id}`, {
      headers,
    });
  }

  ingressarTorneio(torneio: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.post(
      `http://localhost:3000/api/torneio/ingressar/individual`,
      { torneio },
      { headers },
    );
  }
  ingressarTorneioEquipe(torneio: string, equipe: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.post(
      `http://localhost:3000/api/torneio/ingressar/equipe`,
      { torneio, equipe },
      { headers },
    );
  }

  getPartidasDoTorneio(torneio: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get(
      `http://localhost:3000/api/torneio/partidas/${torneio}`,
      { headers },
    );
  }

  gerarPartidas(torneio: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.post(
      'http://localhost:3000/api/torneio/gerarPartidas',
      { torneio },
      { headers },
    );
  }

  buscarPartidaPorId(partida: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get(
      `http://localhost:3000/api/torneio/partida/${partida}`,
      { headers },
    );
  }

  finalizarTorneio(torneio: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.put(
      `http://localhost:3000/api/torneio/finalizarTorneio`,
      { torneio },
      { headers },
    );
  }

  buscarTorneiosDoUsuario(): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get(
      `http://localhost:3000/api/torneio/torneiosDoUsuario`,
      { headers },
    );
  }

  getResultados(): Observable<any> {
    return this.http.get('http://localhost:3000/api/torneio/resultados');
  }

  getRanking(): Observable<any> {
    return this.http.get('http://localhost:3000/api/torneio/ranking');
  }

  getPartidasDoJogador(): Observable<PartidaJogadorResumo[]> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<PartidaJogadorResumo[]>(
      'http://localhost:3000/api/torneio/partidas-jogador',
      { headers },
    );
  }
}
