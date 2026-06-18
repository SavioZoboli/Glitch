import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../components/button/button';
import { PaginationControlsComponent } from '../../components/pagination-controls/pagination-controls';
import {
  AgendaService,
  CompromissoAgenda,
  PapelAgenda,
} from '../../services/agenda-service';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import { TournamentService } from '../../services/tournament-service';

type PaginacaoLocal = {
  pagina_atual: number;
  itens_por_pagina: number;
  total_itens: number;
  total_paginas: number;
  tem_proxima_pagina: boolean;
  tem_pagina_anterior: boolean;
};

type CompromissoAgendaUi = {
  eventoId: string;
  titulo: string;
  descricao: string | null;
  inicio: Date | null;
  fim: Date | null;
  papel: PapelAgenda | string;
  origemTipo: string | null;
  origemId: string | null;
  status: string;
};

@Component({
  selector: 'app-schedule-page',
  standalone: true,
  imports: [CommonModule, ButtonComponent, PaginationControlsComponent],
  templateUrl: './schedule.html',
  styleUrls: ['./schedule.scss'],
})
export class SchedulePage implements OnInit {
  carregandoCompromissos = false;
  carregandoAcaoPrincipalIds = new Set<string>();

  compromissosHoje: CompromissoAgendaUi[] = [];
  compromissosHojeTodos: CompromissoAgendaUi[] = [];
  paginacaoHoje: PaginacaoLocal = this.getPaginacaoInicial();

  compromissosProximos: CompromissoAgendaUi[] = [];
  compromissosProximosTodos: CompromissoAgendaUi[] = [];
  paginacaoProximos: PaginacaoLocal = this.getPaginacaoInicial();

  constructor(
    private agendaService: AgendaService,
    private tournamentService: TournamentService,
    private notifService: SystemNotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarCompromissos();
  }

  carregarCompromissos(): void {
    this.carregandoCompromissos = true;

    this.agendaService
      .getMeusCompromissos()
      .pipe(
        finalize(() => {
          this.carregandoCompromissos = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (compromissosBrutos) => {
          const compromissos = this.mapearCompromissos(compromissosBrutos);
          const fimHoje = this.getFimDoDia(new Date());

          this.compromissosHojeTodos = compromissos.filter(
            (compromisso) =>
              compromisso.inicio !== null &&
              this.isMesmoDia(compromisso.inicio, new Date()),
          );

          this.compromissosProximosTodos = compromissos.filter(
            (compromisso) =>
              compromisso.inicio !== null &&
              compromisso.inicio.getTime() > fimHoje.getTime(),
          );

          this.carregarPaginaHoje(1);
          this.carregarPaginaProximos(1);
        },
        error: () => {
          this.compromissosHoje = [];
          this.compromissosHojeTodos = [];
          this.compromissosProximos = [];
          this.compromissosProximosTodos = [];
          this.paginacaoHoje = this.getPaginacaoInicial();
          this.paginacaoProximos = this.getPaginacaoInicial();
          this.notifService.notificar('erro', 'Erro ao carregar sua agenda.');
        },
      });
  }

  carregarPaginaHoje(pagina: number): void {
    const paginacao = this.paginarLista(this.compromissosHojeTodos, pagina);
    this.compromissosHoje = paginacao.dados;
    this.paginacaoHoje = paginacao.paginacao;
  }

  carregarPaginaProximos(pagina: number): void {
    const paginacao = this.paginarLista(this.compromissosProximosTodos, pagina);
    this.compromissosProximos = paginacao.dados;
    this.paginacaoProximos = paginacao.paginacao;
  }

  executarAcaoPrincipal(compromisso: CompromissoAgendaUi): void {
    const chave = String(compromisso?.eventoId ?? '').trim();
    if (!chave || this.carregandoAcaoPrincipalIds.has(chave)) {
      return;
    }

    const papel = String(compromisso?.papel ?? '').trim().toUpperCase();
    const origemTipo = String(compromisso?.origemTipo ?? '').trim().toUpperCase();
    const origemId = String(compromisso?.origemId ?? '').trim();

    if (origemTipo !== 'TORNEIO' || !origemId) {
      this.notifService.notificar(
        'aviso',
        'Nao foi possivel identificar o torneio deste compromisso.',
      );
      return;
    }

    if (papel === 'ORGANIZADOR') {
      this.router.navigate(['/tournaments/manage', origemId]);
      return;
    }

    if (papel === 'ESPECTADOR') {
      this.carregandoAcaoPrincipalIds.add(chave);

      this.tournamentService
        .getTorneioById(origemId)
        .pipe(
          finalize(() => {
            this.carregandoAcaoPrincipalIds.delete(chave);
            this.cdr.detectChanges();
          }),
        )
        .subscribe({
          next: (detalhe) => {
            const link = this.extrairLinkTransmissao(detalhe);
            if (!link) {
              this.notifService.notificar(
                'aviso',
                'Esse torneio nao possui transmissao ao vivo.',
              );
              return;
            }

            const linkNormalizado = this.normalizarLink(link);
            window.open(linkNormalizado, '_blank', 'noopener,noreferrer');
          },
          error: () => {
            this.notifService.notificar(
              'erro',
              'Erro ao buscar link de transmissao do torneio.',
            );
          },
        });
      return;
    }

    this.router.navigate(['/tournaments/details', origemId]);
  }

  abrirDetalhes(compromisso: CompromissoAgendaUi): void {
    const origemTipo = String(compromisso?.origemTipo ?? '').trim().toUpperCase();
    const origemId = String(compromisso?.origemId ?? '').trim();

    if (origemTipo === 'TORNEIO' && origemId) {
      this.router.navigate(['/tournaments/details', origemId]);
      return;
    }

    this.notifService.notificar(
      'aviso',
      'Nao foi possivel abrir detalhes: torneio nao identificado.',
    );
  }

  getAcaoPrincipalLabel(compromisso: CompromissoAgendaUi): string {
    const papel = String(compromisso?.papel ?? '').trim().toUpperCase();
    if (papel === 'ORGANIZADOR') return 'Iniciar torneio';
    if (papel === 'ESPECTADOR') {
      return this.isCarregandoAcaoPrincipal(compromisso)
        ? 'Buscando...'
        : 'Assistir ao vivo';
    }
    return 'Ir para torneio';
  }

  getAcaoPrincipalIcon(compromisso: CompromissoAgendaUi): string {
    const papel = String(compromisso?.papel ?? '').trim().toUpperCase();
    if (papel === 'ORGANIZADOR') return 'play_arrow';
    if (papel === 'ESPECTADOR') return 'live_tv';
    return 'sports_esports';
  }

  isCarregandoAcaoPrincipal(compromisso: CompromissoAgendaUi): boolean {
    const chave = String(compromisso?.eventoId ?? '').trim();
    return this.carregandoAcaoPrincipalIds.has(chave);
  }

  private extrairLinkTransmissao(detalhe: any): string | null {
    const candidatos = [
      detalhe?.transmissao?.streaming,
      detalhe?.transmissao?.coleta,
      detalhe?.plataforma_streaming,
      detalhe?.plataforma_coleta,
    ];

    for (const valor of candidatos) {
      if (typeof valor !== 'string') continue;
      const texto = valor.trim();
      if (texto.length > 0) return texto;
    }

    return null;
  }

  private normalizarLink(link: string): string {
    if (/^https?:\/\//i.test(link)) {
      return link;
    }
    return `https://${link}`;
  }

  getPapelLabel(papel: string): string {
    const papelNormalizado = String(papel ?? '').trim().toUpperCase();
    if (papelNormalizado === 'ORGANIZADOR') return 'Organizador';
    if (papelNormalizado === 'INSCRITO') return 'Participante';
    if (papelNormalizado === 'ESPECTADOR') return 'Espectador';
    return 'Participante';
  }

  trackByEventoId(_index: number, compromisso: CompromissoAgendaUi): string {
    return compromisso.eventoId;
  }

  private mapearCompromissos(
    compromissosBrutos: CompromissoAgenda[],
  ): CompromissoAgendaUi[] {
    return (compromissosBrutos ?? [])
      .map((compromisso) => {
        const eventoId = String(compromisso?.evento_id ?? '').trim();
        const titulo = String(compromisso?.evento?.titulo ?? '').trim();
        const descricao = this.getTexto(compromisso?.evento?.descricao);
        const papel = String(compromisso?.papel ?? '').trim().toUpperCase();
        const origemTipo = this.getTexto(compromisso?.evento?.origem?.tipo)?.toUpperCase() ?? null;
        const origemId = this.getTexto(compromisso?.evento?.origem?.id);
        const status = String(compromisso?.evento?.status ?? '').trim().toUpperCase();

        const inicio = this.toDate(compromisso?.evento?.inicio);
        const fim = this.toDate(compromisso?.evento?.fim);

        return {
          eventoId,
          titulo,
          descricao,
          inicio,
          fim,
          papel,
          origemTipo,
          origemId,
          status,
        } as CompromissoAgendaUi;
      })
      .filter((compromisso) => {
        if (!compromisso.eventoId || !compromisso.titulo) return false;
        if (!compromisso.inicio) return false;
        return true;
      })
      .sort((a, b) => (a.inicio?.getTime() ?? 0) - (b.inicio?.getTime() ?? 0));
  }

  private paginarLista(
    lista: CompromissoAgendaUi[],
    pagina: number,
  ): { dados: CompromissoAgendaUi[]; paginacao: PaginacaoLocal } {
    const itensPorPagina = 10;
    const totalItens = lista.length;
    const totalPaginas =
      totalItens === 0 ? 0 : Math.ceil(totalItens / itensPorPagina);
    const paginaValida = Math.max(1, Math.min(pagina, totalPaginas || 1));
    const inicio = (paginaValida - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;

    return {
      dados: lista.slice(inicio, fim),
      paginacao: {
        pagina_atual: paginaValida,
        itens_por_pagina: itensPorPagina,
        total_itens: totalItens,
        total_paginas: totalPaginas,
        tem_proxima_pagina: paginaValida < totalPaginas,
        tem_pagina_anterior: paginaValida > 1,
      },
    };
  }

  private getPaginacaoInicial(): PaginacaoLocal {
    return {
      pagina_atual: 1,
      itens_por_pagina: 10,
      total_itens: 0,
      total_paginas: 0,
      tem_proxima_pagina: false,
      tem_pagina_anterior: false,
    };
  }

  private getFimDoDia(data: Date): Date {
    const fim = new Date(data);
    fim.setHours(23, 59, 59, 999);
    return fim;
  }

  private isMesmoDia(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private getTexto(valor: unknown): string | null {
    if (typeof valor !== 'string') return null;
    const texto = valor.trim();
    return texto.length > 0 ? texto : null;
  }

  private toDate(valor: unknown): Date | null {
    if (!valor) return null;
    const data = valor instanceof Date ? valor : new Date(String(valor));
    return Number.isNaN(data.getTime()) ? null : data;
  }
}
