import { Component, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TeamInviteBoxComponent } from '../../components/team-invite-box-component/team-invite-box-component';
import {
  PartidaJogadorResumo,
  TournamentService,
} from '../../services/tournament-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Equipe, EquipeService } from '../../services/equipe-service';

type PartidaJogadorResumoUI = Omit<PartidaJogadorResumo, 'data_partida'> & {
  data_partida: Date | null;
};
@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [MatIconModule, TeamInviteBoxComponent, AsyncPipe, RouterLink],
})
export class DashboardComponent {
  playerName = 'Jogador';
  private torneiosInscritosSubject: BehaviorSubject<any[]> =
    new BehaviorSubject<any[]>([]);
  torneiosInscritos: Observable<any[]> =
    this.torneiosInscritosSubject.asObservable();
  minhasEquipes: Observable<Equipe[]>;

  private relatoriosSubject = new BehaviorSubject<PartidaJogadorResumoUI[]>([]);
  relatorios = this.relatoriosSubject.asObservable();
  constructor(
    private torneioService: TournamentService,
    private equipeService: EquipeService,
  ) {
    this.buscarRelatorioPartidasJogador();
    this.carregarEquipes();
    this.minhasEquipes = this.equipeService.minhasEquipes$;
  }

  //Trazer o nome do localstorage
  nickname: string = '';

  ngOnInit() {
    const userData = localStorage.getItem('userData');

    if (userData) {
      const parsed = JSON.parse(userData);
      this.nickname = parsed.nickname;
    }

    this.buscarRelatorioPartidasJogador();
  }

  carregarEquipes(): void {
    this.equipeService.carregarEquipes();
  }

  buscarRelatorioPartidasJogador() {
    this.torneioService.getPartidasDoJogador().subscribe({
      next: (res) => {
        this.relatoriosSubject.next(
          res.map((item) => ({
            ...item,
            data_partida: item.data_partida
              ? new Date(item.data_partida)
              : null,
          })),
        );
      },
      error: (err) => console.log(err),
    });
  }
}
