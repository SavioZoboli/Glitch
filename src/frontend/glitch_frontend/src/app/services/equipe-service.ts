import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';

// Defina as interfaces (ajuste conforme seu retorno da API)
export interface Membro {
  nickname: string;
  funcao: string;
  is_lider: boolean;
  is_titular: boolean;
}

export interface Equipe {
  nome: string;
  membros: Membro[];
}

// Interface para o nosso estado
export interface EquipesState {
  minhasEquipes: Equipe[];
  outrasEquipes: Equipe[];
}

@Injectable({
  providedIn: 'root'
})
export class EquipeService {

  private readonly equipesState = new BehaviorSubject<EquipesState>({
    minhasEquipes: [],
    outrasEquipes: []
  });

  public minhasEquipes$ = this.equipesState.asObservable().pipe(
    map(state => state.minhasEquipes)
  );
  
  public outrasEquipes$ = this.equipesState.asObservable().pipe(
    map(state => state.outrasEquipes)
  );

  public carregarEquipes(): void {

    let userData:string = localStorage.getItem('userData') || ''

    const currentUserNickname = JSON.parse(userData).nickname// Ex: 'usuario.logado'

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
      }
    });
  }

  private processarEAtualizarEquipes(allEquipes: Equipe[], currentUserNickname: string): void {
    
    const estadoInicial: EquipesState = { minhasEquipes: [], outrasEquipes: [] };

    // 3. A LÓGICA EFICIENTE (Single Pass com 'reduce')
    const novoEstado = allEquipes.reduce((acc: EquipesState, equipe: Equipe) => {
      
      // 4. A VERIFICAÇÃO EFICIENTE (com 'some')
      const isMembro = equipe.membros.some(
        membro => membro.nickname === currentUserNickname
      );
      // 5. Separação
      if (isMembro) {
        acc.minhasEquipes.push(equipe);
      } else {
        acc.outrasEquipes.push(equipe);
      }

      return acc; // Retorna o acumulador para a próxima iteração
    }, estadoInicial); // 'estadoInicial' é o valor inicial do 'acc'

    // 6. Emite o NOVO estado completo para o BehaviorSubject
    this.equipesState.next(novoEstado);
  }
  
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

  public getEquipes():Observable<any>{
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
    return this.httpClient.get('http://localhost:3000/api/equipe/equipes',{headers})
  }

  public getConvites():Observable<any>{
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
    return this.httpClient.get('http://localhost:3000/api/equipe/invites',{headers})
  }

  public aceitarConvite(equipe:string):Observable<any>{
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
    return this.httpClient.put('http://localhost:3000/api/equipe/aceitarInvite',{equipe},{headers})
  }

  public recusarConvite(equipe:string):Observable<any>{
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
    return this.httpClient.put('http://localhost:3000/api/equipe/recusarInvite',{equipe},{headers})
  }

}
