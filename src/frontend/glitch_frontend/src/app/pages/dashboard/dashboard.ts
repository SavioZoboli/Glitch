import { Component, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TeamInviteBoxComponent } from '../../components/team-invite-box-component/team-invite-box-component';
import { TournamentService } from '../../services/tournament-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Equipe, EquipeService } from '../../services/equipe-service';

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

  private relatoriosSubject = new BehaviorSubject<any[]>([]);
  relatorios = this.relatoriosSubject.asObservable();
  constructor(
    private torneioService: TournamentService,
    private equipeService: EquipeService,
  ) {
    this.buscarRelatorioDeTorneios();
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
  }

  carregarEquipes(): void {
    this.equipeService.carregarEquipes();
  }

  buscarRelatorioDeTorneios() {
    this.torneioService.buscarTorneiosDoUsuario().subscribe({
      next: (res) => {
        res.forEach((t: any) => {
          t.data_realizacao = new Date(t.data_realizacao);
        });
        this.torneiosInscritosSubject.next(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
