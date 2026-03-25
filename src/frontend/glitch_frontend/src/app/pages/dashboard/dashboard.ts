import { Component, ViewEncapsulation } from '@angular/core';
import { Footer } from '../../components/footer/footer';
import { MatIconModule } from '@angular/material/icon';
import { Navigation } from '../../components/navigation/navigation';
import { TeamInviteBoxComponent } from '../../components/team-invite-box-component/team-invite-box-component';
import { TournamentService } from '../../services/tournament-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [MatIconModule, Navigation, TeamInviteBoxComponent, AsyncPipe],
})
export class DashboardComponent {
  playerName = 'Jogador';
  private torneiosInscritosSubject: BehaviorSubject<any[]> =
    new BehaviorSubject<any[]>([]);
  torneiosInscritos: Observable<any[]> =
    this.torneiosInscritosSubject.asObservable();

  private relatoriosSubject = new BehaviorSubject<any[]>([]);
  relatorios = this.relatoriosSubject.asObservable();
  constructor(private torneioService: TournamentService) {
    this.buscarRelatorioDeTorneios();
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

  torneiosMock = [
    {
      id_torneio: '1',
      data_realizacao: new Date(),
      nome_torneio: 'Campeonato Teste',
      nome_jogo: 'FIFA 24',
      organizador: 'Letícia',
      status_inscricao: 'INSCRITO',
    },
    {
      id_torneio: '2',
      data_realizacao: new Date(),
      nome_torneio: 'Copa Debug',
      nome_jogo: 'CS2',
      organizador: 'Admin',
      status_inscricao: 'INSCRITO',
    },
  ];

  relatoriosMock = [
    {
      id: '1',
      data: new Date(),
      nome: 'Campeonato X',
      situacao: 'FINALIZADO',
    },
    {
      id: '2',
      data: new Date(),
      nome: 'Copa Y',
      situacao: 'FINALIZADO',
    },
  ];
}
