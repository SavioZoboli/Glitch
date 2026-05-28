import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SystemNotificationService } from './misc/system-notification-service';

@Injectable({
  providedIn: 'root',
})
export class AuthSessionService {
  private redirecionandoPorSessao = false;
  private monitoramentoAtivo = false;
  private monitoramentoId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private router: Router,
    private sysNotifService: SystemNotificationService,
  ) {}

  tokenValido(token: string | null): boolean {
    if (!token) return false;

    const payload = this.extrairPayload(token);
    if (!payload) return false;

    if (!payload.exp) return true;

    const agoraSegundos = Math.floor(Date.now() / 1000);
    return payload.exp > agoraSegundos;
  }

  iniciarMonitoramentoSessao(intervaloMs: number = 1000): void {
    if (this.monitoramentoAtivo) return;

    this.monitoramentoAtivo = true;
    this.verificarSessaoAtual();

    this.monitoramentoId = setInterval(() => {
      this.verificarSessaoAtual();
    }, intervaloMs);
  }

  redirecionarParaLoginPorSessaoExpirada(
    mensagem: string = 'Sua sessão expirou. Faça login novamente.',
  ): void {
    if (this.redirecionandoPorSessao) return;

    this.redirecionandoPorSessao = true;
    this.limparSessao();
    this.sysNotifService.notificar('aviso', mensagem, 3500);

    this.router.navigate(['/login']).finally(() => {
      setTimeout(() => {
        this.redirecionandoPorSessao = false;
      }, 300);
    });
  }

  private limparSessao(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  }

  private verificarSessaoAtual(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      if (!this.rotaAtualEhPublica()) {
        this.redirecionarParaLoginPorSessaoExpirada(
          'Faça login para acessar esta página.',
        );
      }
      return;
    }
    if (this.tokenValido(token)) return;

    this.redirecionarParaLoginPorSessaoExpirada(
      'Sua sessão expirou. Faça login novamente.',
    );
  }

  private rotaAtualEhPublica(): boolean {
    const rota = this.router.url.split('?')[0].split('#')[0] || '/';
    const rotasPublicas = new Set(['/', '/login', '/create-account']);
    return rotasPublicas.has(rota);
  }

  private extrairPayload(token: string): { exp?: number } | null {
    try {
      const partes = token.split('.');
      if (partes.length < 2) return null;

      const payloadBase64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = decodeURIComponent(
        atob(payloadBase64)
          .split('')
          .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join(''),
      );

      return JSON.parse(payloadJson);
    } catch {
      return null;
    }
  }
}
