import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TournamentService } from '../../services/tournament-service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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

  torneioSelecionado: any = null;
  embedUrl: SafeResourceUrl | null = null;

  carregando = false;
  erro: string | null = null;

  constructor(
    private tournamentService: TournamentService,
    private sanitizer: DomSanitizer,
  ) {}

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
      next: (res: any[]) => { this.resultados = res; },
      error: () => {},
    });

    this.tournamentService.getRanking().subscribe({
      next: (res: any[]) => { this.ranking = res; },
      error: () => {},
    });
  }

  trocarAba(aba: 'ao-vivo' | 'proximos' | 'resultados' | 'ranking') {
    this.abaAtiva = aba;
    if (aba !== 'ao-vivo') {
      this.torneioSelecionado = null;
      this.embedUrl = null;
    }
  }

  assistir(torneio: any) {
    this.torneioSelecionado = torneio;
    this.embedUrl = this.gerarEmbedUrl(torneio.link_transmissao);
  }

  fecharPlayer() {
    this.torneioSelecionado = null;
    this.embedUrl = null;
  }

  gerarEmbedUrl(link: string): SafeResourceUrl | null {
    if (!link) return null;

    let embedUrl = '';

    // YouTube: youtube.com/watch?v=ID ou youtu.be/ID
    const youtubeMatch = link.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (youtubeMatch) {
      embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }

    // Twitch: twitch.tv/CANAL
    const twitchMatch = link.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
    if (twitchMatch) {
      embedUrl = `https://player.twitch.tv/?channel=${twitchMatch[1]}&parent=localhost`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }

    // Kick: kick.com/CANAL
    const kickMatch = link.match(/kick\.com\/([a-zA-Z0-9_-]+)/);
    if (kickMatch) {
      embedUrl = `https://player.kick.com/${kickMatch[1]}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }

    return null;
  }

  getModoInscricao(modo: string): string {
    if (!modo) return '-';
    return modo.charAt(0).toUpperCase() + modo.slice(1).toLowerCase();
  }

  getPlataforma(link: string): string {
    if (!link) return '';
    if (link.includes('youtube') || link.includes('youtu.be')) return 'YouTube';
    if (link.includes('twitch')) return 'Twitch';
    if (link.includes('kick')) return 'Kick';
    return 'Live';
  }
}