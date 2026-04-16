import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Navigation } from '../../components/navigation/navigation';
import { TeamInviteBoxComponent } from '../../components/team-invite-box-component/team-invite-box-component';
import { TournamentService } from '../../services/tournament-service';
import { EquipeService, Equipe } from '../../services/equipe-service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { AsyncPipe, CommonModule, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  imports: [
    MatIconModule,
    Navigation,
    TeamInviteBoxComponent,
    AsyncPipe,
    CommonModule,
    NgClass,
    RouterLink,
  ],
})
export class DashboardComponent implements OnInit, OnDestroy {

  nickname: string = '';
  nomeCompleto: string = '';

  private torneiosInscritosSubject = new BehaviorSubject<any[]>([]);
  torneiosInscritos$: Observable<any[]> = this.torneiosInscritosSubject.asObservable();

  private historicoSubject = new BehaviorSubject<any[]>([]);
  historico$: Observable<any[]> = this.historicoSubject.asObservable();

  minhasEquipes$: Observable<Equipe[]>;

  loadingTorneios = true;
  loadingEquipes = true;

  private subs: Subscription[] = [];

  constructor(
    private torneioService: TournamentService,
    private equipeService: EquipeService,
  ) {
    this.minhasEquipes$ = this.equipeService.minhasEquipes$;
  }

  ngOnInit(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      this.nickname = parsed.nickname || '';
      this.nomeCompleto = parsed.nome || '';
    }
    this.carregarTorneios();
    this.carregarEquipes();
  }

  carregarTorneios(): void {
    this.loadingTorneios = true;
    const sub = this.torneioService.buscarTorneiosDoUsuario().subscribe({
      next: (res) => {
        const todos: any[] = res.map((t: any) => ({
          ...t,
          data_realizacao: new Date(t.data_realizacao),
        }));
        const ativos = todos.filter(t => t.status_inscricao !== 'FINALIZADO');
        const historico = todos.filter(t => t.status_inscricao === 'FINALIZADO');
        this.torneiosInscritosSubject.next(ativos);
        this.historicoSubject.next(historico);
        this.loadingTorneios = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingTorneios = false;
      },
    });
    this.subs.push(sub);
  }

  carregarEquipes(): void {
    this.equipeService.carregarEquipes();
    this.loadingEquipes = false;
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  torneiosMock = [
    { id_torneio: '1', data_realizacao: new Date(), nome_torneio: 'Campeonato Teste', nome_jogo: 'FIFA 24', organizador: 'Letícia', status_inscricao: 'INSCRITO' },
    { id_torneio: '2', data_realizacao: new Date(), nome_torneio: 'Copa Debug', nome_jogo: 'CS2', organizador: 'Admin', status_inscricao: 'INSCRITO' },
  ];

  relatoriosMock = [
    { id: '1', data: new Date(), nome_torneio: 'Campeonato X', status_inscricao: 'FINALIZADO' },
    { id: '2', data: new Date(), nome_torneio: 'Copa Y', status_inscricao: 'FINALIZADO' },
  ];

  equipesMock: Equipe[] = [
    { id: '1', nome: 'Os Invictos', membros: [] },
    { id: '2', nome: 'Squad Glitch', membros: [] },
  ];
}