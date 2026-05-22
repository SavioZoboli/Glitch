import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TournamentService } from '../../services/tournament-service';
import { RouterLink } from '@angular/router';           
import { MatIconModule } from '@angular/material/icon'; 


@Component({
  selector: 'app-spectator',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, MatIconModule],
  templateUrl: './spectator.html',
  styleUrls: ['./spectator.scss'],
})
export class SpectatorComponent implements OnInit {
  abaAtiva: 'ao-vivo' | 'proximos' | 'resultados' | 'ranking' = 'ao-vivo';

  torneiosAoVivo: any[] = [];
  proximosTorneios: any[] = [];
  resultados: any[] = [];
  ranking: any[] = [];

  carregando = false;
  erro: string | null = null;

  constructor(private tournamentService: TournamentService) {}

  ngOnInit() {
    this.carregarTodos();
  }

  private carregarTodos() {
    this.carregando = true;
    this.erro = null;

    this.tournamentService.getTournaments().subscribe({
      next: (torneios: any[]) => {
        const agora = new Date();

        this.torneiosAoVivo = torneios.filter((t) => {
          const inicio = new Date(t.dt_inicio);
          return !t.dt_fim && inicio <= agora;
        });

        this.proximosTorneios = torneios.filter((t) => {
          const inicio = new Date(t.dt_inicio);
          return !t.dt_fim && inicio > agora;
        });

        this.carregando = false;
      },
      error: () => {
        this.erro = 'Erro ao carregar torneios.';
        this.carregando = false;
      },
    });

    this.tournamentService.getResultados().subscribe({
      next: (res: any[]) => {
        this.resultados = res;
      },
      error: () => {},
    });

    this.tournamentService.getRanking().subscribe({
      next: (res: any[]) => {
        this.ranking = res;
      },
      error: () => {},
    });
  }

  trocarAba(aba: 'ao-vivo' | 'proximos' | 'resultados' | 'ranking') {
    this.abaAtiva = aba;
  }

  getModoInscricao(modo: string): string {
    if (!modo) return '-';
    return modo.charAt(0).toUpperCase() + modo.slice(1).toLowerCase();
  }
}