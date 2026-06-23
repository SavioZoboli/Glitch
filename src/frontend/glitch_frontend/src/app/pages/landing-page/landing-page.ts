import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Carrousel } from '../../components/carrousel/carrousel';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TournamentService } from '../../services/tournament-service';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario-service';

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

  constructor(
    private tournamentService: TournamentService,
    private router: Router,
    private usuarioService: UsuarioService,
  ) {
    this.buscarTorneios();
    this.buscarTorneiosFinalizados();
    this.buscarRanking();
  }

  getAvatarRanking(r: any): string {
    const avatar = r?.avatarUrl ?? r?.avatar_url ?? null;
    return this.usuarioService.obterAvatarComFallback(avatar);
  }

  verTorneio(id: string) {
    console.log('VER ID enviado:', id);
    
    this.router.navigate(['/login'], {
      queryParams: {
        redirect: `/tournaments/details/${id}`,
      },
    });
  }

  participarTorneio(id: string) {
    console.log('Participar torneio:', id);

    this.router.navigate(['/login'], {
      queryParams: {
        redirect: '/tournaments',},
    });
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
      },
    });
  }

  private buscarTorneiosFinalizados() {
    this.tournamentService.getResultados().subscribe({
      next: (res) => {
        const lista = Array.isArray(res) ? res : [];
        this.finalizadosSubject.next(lista.slice(0, 3));
      },
      error: () => {
        this.finalizadosSubject.next([]);
      },
    });
  }

  private buscarRanking() {
    this.tournamentService.getRanking().subscribe({
      next: (res) => this.rankingSubject.next(res),
      error: (err) => console.error('Erro ao buscar ranking:', err),
    });
  }
}
