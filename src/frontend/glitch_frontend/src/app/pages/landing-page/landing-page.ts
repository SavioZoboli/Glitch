import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Carrousel } from "../../components/carrousel/carrousel";
import { Observable, Subject } from 'rxjs';
import { TournamentService } from '../../services/tournament-service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule,
    Carrousel
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPageComponent {

  private hojeSubject: Subject<any[]> = new Subject<any[]>();
  hoje$: Observable<any[]> = this.hojeSubject.asObservable();

  private semanaSubject: Subject<any[]> = new Subject<any[]>();
  semana$: Observable<any[]> = this.semanaSubject.asObservable();

  private finalizadosSubject: Subject<any[]> = new Subject<any[]>();
  finalizados$: Observable<any[]> = this.finalizadosSubject.asObservable();

  private rankingSubject: Subject<any[]> = new Subject<any[]>();
  ranking$: Observable<any[]> = this.rankingSubject.asObservable();

  constructor(private tournamentService: TournamentService) {
    this.buscarTorneios();
    this.buscarRanking();
  }

  private buscarTorneios() {
    this.tournamentService.getTournaments().subscribe({
      next: (res) => {
        const agora = new Date();
        const inicioDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
        const fimDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59);
        const fimSemana = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 7);

        this.hojeSubject.next(res.filter((t: any) => {
          const dt = new Date(t.dt_inicio);
          return !t.dt_fim && dt >= inicioDia && dt <= fimDia;
        }));

        this.semanaSubject.next(res.filter((t: any) => {
          const dt = new Date(t.dt_inicio);
          return !t.dt_fim && dt > fimDia && dt <= fimSemana;
        }));

        this.finalizadosSubject.next(
          res
            .filter((t: any) => t.dt_fim)
            .sort((a: any, b: any) => new Date(b.dt_fim).getTime() - new Date(a.dt_fim).getTime())
        );
      }
    });
  }

  private buscarRanking() {
    this.tournamentService.getRanking().subscribe({
      next: (res) => this.rankingSubject.next(res)
    });
  }
}
