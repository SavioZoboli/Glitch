import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { finalize, forkJoin } from 'rxjs';
import { ButtonComponent } from '../../components/button/button';
import { PaginationControlsComponent } from '../../components/pagination-controls/pagination-controls';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import {
  PaginacaoResposta,
  TournamentService,
} from '../../services/tournament-service';

type TorneioAoVivo = {
  codigo: string;
  nome: string;
  dt_inicio: string | Date | null;
  dt_fim: string | Date | null;
  jogo_nome: string;
  organizador: string;
};

type ResultadoAtual = {
  etapa: string;
  status_etapa: string;
  data_partida: Date | null;
  jogador_a: string;
  placar_a: number;
  jogador_b: string;
  placar_b: number;
  vencedor: string;
  status_partida: string;
};

type RankingJogador = {
  posicao: number;
  nickname: string;
  vitorias: number;
};

type RankingEquipe = {
  posicao: number;
  nome_equipe: string;
  vitorias: number;
};

type EtapaRelatorioApi = {
  etapa?: unknown;
  status_etapa?: unknown;
  partidas?: PartidaRelatorioApi[];
};

type PartidaRelatorioApi = {
  data_inicio?: unknown;
  status_partida?: unknown;
  confrontos?: ConfrontoRelatorioApi[];
};

type ConfrontoRelatorioApi = {
  jogador_a?: unknown;
  placar_a?: unknown;
  jogador_b?: unknown;
  placar_b?: unknown;
  vencedor?: unknown;
};

@Component({
  selector: 'app-spectator',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    MatIconModule,
    PaginationControlsComponent,
  ],
  templateUrl: './spectator.html',
  styleUrls: ['./spectator.scss'],
})
export class SpectatorPage implements OnInit {
  torneiosAoVivo: TorneioAoVivo[] = [];
  torneiosAoVivoTodos: TorneioAoVivo[] = [];
  carregandoTorneios = false;
  paginacaoAcontecendo: PaginacaoResposta = this.getPaginacaoInicial();
  proximosTorneios: TorneioAoVivo[] = [];
  carregandoProximosTorneios = false;
  paginacaoProximos: PaginacaoResposta = this.getPaginacaoInicial();
  adicionandoAgendaIds = new Set<string>();

  isDetalhesModalOpen = false;
  carregandoDetalhes = false;
  torneioSelecionado: TorneioAoVivo | null = null;
  detalheTorneio: any = null;
  resultadosAtuais: ResultadoAtual[] = [];
  rankingJogadoresMock: RankingJogador[] = [
    { posicao: 1, nickname: 'Player1', vitorias: 120 },
    { posicao: 2, nickname: 'Player2', vitorias: 95 },
    { posicao: 3, nickname: 'Player3', vitorias: 80 },
    { posicao: 4, nickname: 'Player4', vitorias: 60 },
  ];
  rankingEquipesMock: RankingEquipe[] = [
    { posicao: 1, nome_equipe: 'Alpha Wolves', vitorias: 88 },
    { posicao: 2, nome_equipe: 'Night Ninjas', vitorias: 76 },
    { posicao: 3, nome_equipe: 'Rapid Flames', vitorias: 65 },
    { posicao: 4, nome_equipe: 'Blue Phoenix', vitorias: 51 },
  ];

  constructor(
    private tournamentService: TournamentService,
    private notifService: SystemNotificationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarTorneiosAoVivo();
    this.carregarProximosTorneios(1);
  }

  carregarTorneiosAoVivo(): void {
    this.carregandoTorneios = true;

    this.tournamentService
      .getTorneiosEmAndamento()
      .pipe(
        finalize(() => {
          this.carregandoTorneios = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (torneiosBrutos) => {
          this.torneiosAoVivoTodos = this.mapearTorneios(torneiosBrutos);
          this.carregarPaginaAcontecendo(
            this.paginacaoAcontecendo.pagina_atual || 1,
          );
        },
        error: () => {
          this.torneiosAoVivo = [];
          this.torneiosAoVivoTodos = [];
          this.paginacaoAcontecendo = this.getPaginacaoInicial();
          this.notifService.notificar(
            'erro',
            'Erro ao carregar torneios em andamento.',
          );
        },
      });
  }

  carregarPaginaAcontecendo(pagina: number): void {
    const itensPorPagina = 10;
    const totalItens = this.torneiosAoVivoTodos.length;
    const totalPaginas =
      totalItens === 0 ? 0 : Math.ceil(totalItens / itensPorPagina);

    const paginaValida = Math.max(
      1,
      Math.min(pagina, totalPaginas || 1),
    );
    const inicio = (paginaValida - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;

    this.torneiosAoVivo = this.torneiosAoVivoTodos.slice(inicio, fim);
    this.paginacaoAcontecendo = {
      pagina_atual: paginaValida,
      itens_por_pagina: itensPorPagina,
      total_itens: totalItens,
      total_paginas: totalPaginas,
      tem_proxima_pagina: paginaValida < totalPaginas,
      tem_pagina_anterior: paginaValida > 1,
    };
  }

  carregarProximosTorneios(pagina: number): void {
    this.carregandoProximosTorneios = true;

    this.tournamentService
      .getProximosTorneios(pagina)
      .pipe(
        finalize(() => {
          this.carregandoProximosTorneios = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (resposta) => {
          this.proximosTorneios = this.mapearTorneios(resposta.dados);
          this.paginacaoProximos =
            resposta.paginacao ?? this.getPaginacaoInicial();
        },
        error: () => {
          this.proximosTorneios = [];
          this.paginacaoProximos = this.getPaginacaoInicial();
          this.notifService.notificar('erro', 'Erro ao carregar proximos torneios.');
        },
      });
  }

  atualizarListas(): void {
    this.carregarTorneiosAoVivo();
    this.carregarProximosTorneios(this.paginacaoProximos.pagina_atual || 1);
  }

  isAdicionandoAgenda(codigoTorneio: string): boolean {
    return this.adicionandoAgendaIds.has(codigoTorneio);
  }

  adicionarNaAgendaComoEspectador(torneio: TorneioAoVivo): void {
    const codigo = String(torneio?.codigo ?? '').trim();
    if (!codigo || this.adicionandoAgendaIds.has(codigo)) {
      return;
    }

    this.adicionandoAgendaIds.add(codigo);

    this.tournamentService
      .adicionarTorneioAgendaEspectador(codigo)
      .pipe(
        finalize(() => {
          this.adicionandoAgendaIds.delete(codigo);
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.notifService.notificar(
            'sucesso',
            'Torneio adicionado na sua agenda.',
          );
        },
        error: (err) => {
          const mensagemErro = this.extrairMensagemErro(err);
          this.notifService.notificar(
            'erro',
            mensagemErro ?? 'Erro ao adicionar torneio na agenda.',
          );
        },
      });
  }

  abrirModalDetalhes(torneio: TorneioAoVivo): void {
    this.torneioSelecionado = torneio;
    this.detalheTorneio = null;
    this.resultadosAtuais = [];
    this.carregandoDetalhes = true;
    this.isDetalhesModalOpen = true;

    forkJoin({
      detalhe: this.tournamentService.getTorneioById(torneio.codigo),
      partidas: this.tournamentService.getPartidasDoTorneio(torneio.codigo),
    })
      .pipe(
        finalize(() => {
          this.carregandoDetalhes = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: ({ detalhe, partidas }) => {
          this.detalheTorneio = detalhe ?? null;
          this.resultadosAtuais = this.extrairResultadosAtuais(partidas);
        },
        error: () => {
          this.notifService.notificar(
            'erro',
            'Erro ao carregar dados do torneio selecionado.',
          );
        },
      });
  }

  fecharModalDetalhes(): void {
    this.isDetalhesModalOpen = false;
    this.carregandoDetalhes = false;
    this.torneioSelecionado = null;
    this.detalheTorneio = null;
    this.resultadosAtuais = [];
  }

  get linkAcesso(): string | null {
    const link =
      this.getTexto(this.detalheTorneio?.transmissao?.streaming) ??
      this.getTexto(this.detalheTorneio?.transmissao?.coleta);

    if (!link) return null;
    return this.normalizarLink(link);
  }

  get linkAcessoTexto(): string | null {
    return (
      this.getTexto(this.detalheTorneio?.transmissao?.streaming) ??
      this.getTexto(this.detalheTorneio?.transmissao?.coleta)
    );
  }

  private mapearTorneios(torneiosBrutos: any[]): TorneioAoVivo[] {
    return (torneiosBrutos ?? [])
      .map((torneio): TorneioAoVivo => {
        return {
          codigo: String(torneio?.codigo ?? ''),
          nome: String(torneio?.nome ?? ''),
          dt_inicio: torneio?.dt_inicio ?? null,
          dt_fim: torneio?.dt_fim ?? null,
          jogo_nome: this.getTexto(torneio?.jogo?.nome) ?? 'Não informado',
          organizador:
            this.getTexto(torneio?.responsavel?.organizador) ?? 'ão informado',
        };
      })
      .filter((torneio) => {
        if (!torneio.codigo) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const inicioA = this.toDate(a.dt_inicio)?.getTime() ?? 0;
        const inicioB = this.toDate(b.dt_inicio)?.getTime() ?? 0;
        return inicioA - inicioB;
      });
  }

  private extrairResultadosAtuais(partidasBrutas: unknown): ResultadoAtual[] {
    if (!Array.isArray(partidasBrutas)) {
      return [];
    }

    const resultados: ResultadoAtual[] = [];

    partidasBrutas.forEach((etapaBruta) => {
      const etapa = etapaBruta as EtapaRelatorioApi;
      const nomeEtapa = this.getTexto(etapa.etapa) ?? 'Etapa';
      const statusEtapa = this.getTexto(etapa.status_etapa) ?? 'Em andamento';

      const partidas = Array.isArray(etapa.partidas) ? etapa.partidas : [];

      partidas.forEach((partida) => {
        const dataPartida = this.toDate(partida.data_inicio);
        const statusPartida = this.getTexto(partida.status_partida) ?? '-';
        const confrontos = Array.isArray(partida.confrontos)
          ? partida.confrontos
          : [];

        confrontos.forEach((confronto: ConfrontoRelatorioApi) => {
          resultados.push({
            etapa: nomeEtapa,
            status_etapa: statusEtapa,
            data_partida: dataPartida,
            jogador_a: this.getTexto(confronto.jogador_a) ?? 'A definir',
            placar_a: this.toScore(confronto.placar_a),
            jogador_b: this.getTexto(confronto.jogador_b) ?? 'A definir',
            placar_b: this.toScore(confronto.placar_b),
            vencedor: this.getTexto(confronto.vencedor) ?? 'Em aberto',
            status_partida: statusPartida,
          });
        });
      });
    });

    return resultados;
  }

  private getTexto(valor: unknown): string | null {
    if (typeof valor !== 'string') return null;
    const texto = valor.trim();
    return texto.length > 0 ? texto : null;
  }

  private normalizarLink(link: string): string {
    if (/^https?:\/\//i.test(link)) {
      return link;
    }

    return `https://${link}`;
  }

  private toDate(valor: unknown): Date | null {
    if (!valor) return null;

    const data = valor instanceof Date ? valor : new Date(String(valor));
    return Number.isNaN(data.getTime()) ? null : data;
  }

  private toScore(valor: unknown): number {
    const score = Number(valor);
    return Number.isFinite(score) ? score : 0;
  }

  private extrairMensagemErro(erro: any): string | null {
    const mensagem = erro?.error?.message ?? erro?.message;
    if (typeof mensagem !== 'string') {
      return null;
    }

    const texto = mensagem.trim();
    return texto.length > 0 ? texto : null;
  }

  private getPaginacaoInicial(): PaginacaoResposta {
    return {
      pagina_atual: 1,
      itens_por_pagina: 10,
      total_itens: 0,
      total_paginas: 0,
      tem_proxima_pagina: false,
      tem_pagina_anterior: false,
    };
  }

  get podioJogadores(): RankingJogador[] {
    if (this.rankingJogadoresMock.length < 3) return [];

    return [
      this.rankingJogadoresMock[1],
      this.rankingJogadoresMock[0],
      this.rankingJogadoresMock[2],
    ];
  }

  get podioEquipes(): RankingEquipe[] {
    if (this.rankingEquipesMock.length < 3) return [];

    return [
      this.rankingEquipesMock[1],
      this.rankingEquipesMock[0],
      this.rankingEquipesMock[2],
    ];
  }
}
