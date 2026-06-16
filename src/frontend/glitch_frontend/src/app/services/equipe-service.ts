import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Defina as interfaces (ajuste conforme seu retorno da API)
export interface Membro {
  nickname: string;
  funcao: string;
  is_lider: boolean;
  is_titular: boolean;
  dt_aceito: Date | null;
  tipo: 'convite' | 'solicitacao';
}

export interface Convite {
  id: string;
  nome: string;
  associacoesMembro: {
    dt_aceito: Date | null;
    dt_saida: Date | null;
    tipo: 'convite' | 'solicitacao';
  }[];
}
export interface Equipe {
  id: string;
  nome: string;
  membros: Membro[];
}

// Interface para o nosso estado
export interface EquipesState {
  minhasEquipes: Equipe[];
  outrasEquipes: Equipe[];
}

@Injectable({
  providedIn: 'root',
})
export class EquipeService {

    private api_url:string = environment.apiURL;


  private readonly equipesState = new BehaviorSubject<EquipesState>({
    minhasEquipes: [],
    outrasEquipes: [],
  });

  public minhasEquipes$ = this.equipesState
    .asObservable()
    .pipe(map((state) => state.minhasEquipes));

  public outrasEquipes$ = this.equipesState
    .asObservable()
    .pipe(map((state) => state.outrasEquipes));

  public carregarEquipes(): void {
    let userData: string = localStorage.getItem('userData') || '';

    const currentUserNickname = JSON.parse(userData).nickname; // Ex: 'usuario.logado'

    // 3. Chame seu método getEquipes() e inscreva-se
    this.getEquipes().subscribe({
      next: (allEquipes) => {
        // 4. QUANDO a API responder, processe os dados
        this.processarEAtualizarEquipes(allEquipes, currentUserNickname);
      },
      error: (err) => {
        console.error('Falha ao buscar equipes:', err);
        // Opcional: Limpar o estado ou emitir um estado de erro
        this.equipesState.next({ minhasEquipes: [], outrasEquipes: [] });
      },
    });
  }

  private processarEAtualizarEquipes(
    allEquipes: Equipe[],
    currentUserNickname: string,
  ): void {
    const estadoInicial: EquipesState = {
      minhasEquipes: [],
      outrasEquipes: [],
    };

    // 3. A LÓGICA EFICIENTE (Single Pass com 'reduce')
    const novoEstado = allEquipes.reduce(
      (acc: EquipesState, equipe: Equipe) => {
        // 4. A VERIFICAÇÃO EFICIENTE (com 'some')
        const membroAceito = equipe.membros.some(
          (membro) =>
            membro.nickname === currentUserNickname &&
            membro.dt_aceito !== null,
        );

        if (membroAceito) {
          acc.minhasEquipes.push(equipe);
        } else {
          acc.outrasEquipes.push(equipe);
        }

        return acc; // Retorna o acumulador para a próxima iteração
      },
      estadoInicial,
    ); // 'estadoInicial' é o valor inicial do 'acc'

    // 6. Emite o NOVO estado completo para o BehaviorSubject
    this.equipesState.next(novoEstado);
  }

  constructor(private httpClient: HttpClient) {}

  public addEquipe(nome: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.httpClient.post(
      `${this.api_url}/api/equipe/add`,
      { nome },
      { headers },
    );
  }

  public convidarJogador(
    equipe: string,
    jogador: {
      nickname: string;
      is_titular: boolean;
      is_lider: boolean;
      funcao: string;
    },
  ): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.httpClient.post(`${this.api_url}/api/equipe/invite`,{equipe,jogador},{headers})
  }

  public getEquipes(): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.httpClient.get(`${this.api_url}/api/equipe/equipes`, {
      headers,
    });
  }

  public getEquipePorId(id: string | null): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.httpClient.get(
      `${this.api_url}/api/equipe/equipe/${id}`,
      { headers },
    );
  }

  public getConvites(): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.httpClient.get(`${this.api_url}/api/equipe/invites`, {
      headers,
    });
  }
  // equipe.service.ts

  aceitarConvite(equipeId: string, usuarioAlvo: string) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

  return this.httpClient.put(
    `${this.api_url}/api/equipe/aceitarInvite`,
    { equipe: equipeId ,usuarioAlvo:usuarioAlvo},
    { headers },
  );
}

  recusarConvite(equipeId: string, usuarioAlvo: string) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

  return this.httpClient.put(
    `${this.api_url}/api/equipe/recusarInvite`,
    { equipe: equipeId ,usuarioAlvo:usuarioAlvo},
    { headers },
  );
}

  public updateEquipe(id: string, novoNome: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.httpClient.put(
      `${this.api_url}/api/equipe/update`,
      { id, novoNome },
      { headers },
    );
  }

  public updateMembro(membro: Membro, equipe: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.httpClient.put(
      `${this.api_url}/api/equipe/updateMembro`,
      { membro, equipe },
      { headers },
    );
  }

  public deleteMembro(nickname:string,equipe:string):Observable<any>{
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.httpClient.put(`${this.api_url}/api/equipe/removeMembro`,{nickname,equipe},{headers})
  }

  public deleteEquipe(id: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.httpClient.delete(
      `${this.api_url}/api/equipe/remove/${id}`,
      { headers },
    );
  }

  public getMinhasEquipes(): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.httpClient.get(
      `${this.api_url}/api/equipe/minhasEquipes`,
      { headers },
    );
  }
}
