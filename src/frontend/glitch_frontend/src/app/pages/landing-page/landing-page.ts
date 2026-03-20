import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Carrousel } from '../../components/carrousel/carrousel';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TournamentService } from '../../services/tournament-service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, Carrousel],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPageComponent {
  private hojeSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private semanaSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(
    [],
  );
  private finalizadosSubject: BehaviorSubject<any[]> = new BehaviorSubject<
    any[]
  >([]);
  private rankingSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(
    [],
  );
  hoje$: Observable<any[]> = this.hojeSubject.asObservable();
  semana$: Observable<any[]> = this.semanaSubject.asObservable();
  finalizados$: Observable<any[]> = this.finalizadosSubject.asObservable();
  ranking$: Observable<any[]> = this.rankingSubject.asObservable();

  constructor(private tournamentService: TournamentService) {
    this.buscarTorneios();
    this.buscarRanking();
  }

  private buscarTorneios() {
    this.tournamentService.getTournaments().subscribe({
      next: (res) => {
        const agora = new Date();
        const anoHoje = agora.getFullYear();
        const mesHoje = agora.getMonth();
        const diaHoje = agora.getDate();

        const hoje = new Date(
          agora.getFullYear(),
          agora.getMonth(),
          agora.getDate(),
          0,
          0,
          0,
          0,
        );
        const amanha = new Date(anoHoje, mesHoje, diaHoje + 1);
        const fimSemana = new Date(anoHoje, mesHoje, diaHoje + 7, 23, 59, 59);

        // Normaliza qualquer ISO string para meia-noite no horário local
        const toLocalDate = (isoString: string): Date => {
          const [ano, mes, dia] = isoString
            .substring(0, 10)
            .split('-')
            .map(Number);
          return new Date(ano, mes - 1, dia, 0, 0, 0, 0);
        };

        const torneios = res.map((t: any) => ({
          ...t,
          dt_inicio_local: toLocalDate(t.dt_inicio),
        }));
        // Torneios de HOJE — dt_inicio == hoje (sem importar hora/fuso)
        this.hojeSubject.next(
          torneios
            .filter((t: any) => {
              const dt = toLocalDate(t.dt_inicio);
              return dt.getTime() === hoje.getTime();
            })
            .slice(0, 3),
        );

        // Próxima SEMANA — dt_inicio > hoje e <= hoje + 7 dias
        this.semanaSubject.next(
          torneios
            .filter((t: any) => {
              const dt = toLocalDate(t.dt_inicio);
              return dt >= amanha && dt <= fimSemana;
            })
            .sort(
              (a: any, b: any) =>
                toLocalDate(a.dt_inicio).getTime() -
                toLocalDate(b.dt_inicio).getTime(),
            )
            .slice(0, 3),
        );

        // ÚLTIMOS torneios — dt_inicio < hoje, os 10 mais recentes
        this.finalizadosSubject.next(
          torneios
            .filter((t: any) => {
              const dt = toLocalDate(t.dt_inicio);
              return dt < hoje;
            })
            .sort(
              (a: any, b: any) =>
                toLocalDate(b.dt_inicio).getTime() -
                toLocalDate(a.dt_inicio).getTime(),
            )
            .slice(0, 3),
        );
      },
    });
  }

  private buscarRanking() {
    // this.tournamentService.getRanking().subscribe({
    //   next: (res) => this.rankingSubject.next(res),
    // });

    //Mock temporário
    this.rankingSubject.next([
      { posicao: 1, nickname: 'Player1', vitorias: 120, jogo: 'LOL' },
      { posicao: 2, nickname: 'Player2', vitorias: 95, jogo: 'CS' },
      { posicao: 3, nickname: 'Player3', vitorias: 80, jogo: 'Valorant' },
      { posicao: 4, nickname: 'Player4', vitorias: 60, jogo: 'Fifa' },
    ]);
  }
}
