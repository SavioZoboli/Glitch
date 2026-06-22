import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router'; // 1. Importar RouterModule
import { filter, finalize, forkJoin, Subscription } from 'rxjs';
import { Footer } from './components/footer/footer';
import { MatIconRegistry } from '@angular/material/icon';
import { SystemNotificationQueue } from './components/system-notification-queue/system-notification-queue';
import { AuthSessionService } from './services/auth-session.service';
import {
  AgendaService,
  NotificacaoAgenda,
} from './services/agenda-service';

@Component({
  selector: 'app-root',
  standalone: true, // 2. Marcar como standalone
  imports: [RouterModule, Footer, SystemNotificationQueue],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('glitch_frontend');
  private readonly intervaloNotificacoesMs = 2 * 60 * 1000;
  private readonly router = inject(Router);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly agendaService = inject(AgendaService);
  private readonly cdr = inject(ChangeDetectorRef);

  // 2. Injete o MatIconRegistry
  private matIconRegistry = inject(MatIconRegistry);
  private routerSubscription: Subscription | null = null;
  private notificacoesIntervalId: ReturnType<typeof setInterval> | null = null;

  notificacoesDiaModal: NotificacaoAgenda[] = [];
  isNotificacoesDiaModalOpen = false;
  carregandoNotificacoesDia = false;

  // 3. Adicione o construtor para configurar a classe de fonte padrão
  constructor() {
    this.matIconRegistry.setDefaultFontSetClass('material-symbols-rounded');
    this.authSessionService.iniciarMonitoramentoSessao();
  }

  ngOnInit(): void {
    this.verificarNotificacoesAgendaModal();

    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarNotificacoesAgendaModal();
      });

    if (!this.notificacoesIntervalId) {
      this.notificacoesIntervalId = setInterval(() => {
        this.verificarNotificacoesAgendaModal();
      }, this.intervaloNotificacoesMs);
    }
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    if (this.notificacoesIntervalId) {
      clearInterval(this.notificacoesIntervalId);
      this.notificacoesIntervalId = null;
    }
  }

  isAuthRoute(): boolean {
    const basePath = this.router.url.split('?')[0].split('#')[0] || '/';
    const publicRoutes = new Set(['/', '/login', '/create-account']);
    return !publicRoutes.has(basePath);
  }

  fecharModalNotificacoesDia(): void {
    this.isNotificacoesDiaModalOpen = false;
    this.marcarNotificacoesComoLidas(this.notificacoesDiaModal);
    this.notificacoesDiaModal = [];
    this.cdr.detectChanges();
  }

  abrirNotificacaoDia(notificacao: NotificacaoAgenda): void {
    this.isNotificacoesDiaModalOpen = false;
    this.marcarNotificacoesComoLidas([notificacao]);
    this.notificacoesDiaModal = [];
    this.cdr.detectChanges();

    const papel = String(notificacao?.papel ?? '').toUpperCase();
    if (papel === 'ESPECTADOR') {
      this.router.navigate(['/spectator']);
      return;
    }

    this.router.navigate(['/tournaments']);
  }

  private verificarNotificacoesAgendaModal(): void {
    if (!this.isAuthRoute()) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const chaveAcesso = this.getChavePrimeiroAcessoDia();
    const primeiroAcessoDia = !sessionStorage.getItem(chaveAcesso);
    if (this.carregandoNotificacoesDia) return;

    this.carregandoNotificacoesDia = true;
    this.agendaService
      .getMinhasNotificacoes(true, 30)
      .pipe(
        finalize(() => {
          this.carregandoNotificacoesDia = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (notificacoes) => {
          const notificacoesElegiveis = (notificacoes ?? []).filter(
            (notificacao) =>
              !notificacao?.is_lida &&
              notificacao?.origem?.tipo === 'TORNEIO',
          );

          const notificacoesParaModal = notificacoesElegiveis.filter(
            (notificacao) => {
              if (notificacao?.tipo_alerta === 'ANTES_5MIN') return true;
              if (notificacao?.tipo_alerta === 'DIA_09H' && primeiroAcessoDia) {
                return true;
              }
              return false;
            },
          );

          if (primeiroAcessoDia) {
            sessionStorage.setItem(chaveAcesso, '1');
          }

          if (notificacoesParaModal.length === 0) {
            return;
          }

          if (this.isNotificacoesDiaModalOpen) {
            const idsAtuais = new Set(
              this.notificacoesDiaModal
                .map((n) => String(n?.id ?? '').trim())
                .filter((id) => id.length > 0),
            );

            const notificacoesNovas = notificacoesParaModal.filter(
              (notificacao) =>
                !idsAtuais.has(String(notificacao?.id ?? '').trim()),
            );

            if (notificacoesNovas.length > 0) {
              this.notificacoesDiaModal = [
                ...this.notificacoesDiaModal,
                ...notificacoesNovas,
              ];
            }
          } else {
            this.notificacoesDiaModal = notificacoesParaModal;
            this.isNotificacoesDiaModalOpen = true;
          }

          this.cdr.detectChanges();
        },
        error: () => {
          if (primeiroAcessoDia) {
            sessionStorage.setItem(chaveAcesso, '1');
          }
          this.cdr.detectChanges();
        },
      });
  }

  private marcarNotificacoesComoLidas(notificacoes: NotificacaoAgenda[]): void {
    const ids = Array.from(
      new Set(
        (notificacoes ?? [])
          .map((notificacao) => String(notificacao?.id ?? '').trim())
          .filter((id) => id.length > 0),
      ),
    );

    if (ids.length === 0) return;

    const chamadas = ids.map((id) => this.agendaService.marcarNotificacaoComoLida(id));

    forkJoin(chamadas).subscribe({
      next: () => {},
      error: () => {},
    });
  }

  private getChavePrimeiroAcessoDia(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const dataRef = `${ano}-${mes}-${dia}`;

    let nickname = 'anon';
    try {
      const dados = JSON.parse(localStorage.getItem('userData') ?? '{}');
      const nickLido = String(dados?.nickname ?? '').trim();
      if (nickLido) nickname = nickLido;
    } catch {
      nickname = 'anon';
    }

    return `agenda_notificacoes_dia_modal_${nickname}_${dataRef}`;
  }
}
