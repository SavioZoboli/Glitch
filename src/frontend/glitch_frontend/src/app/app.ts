import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // 1. Importar RouterModule
import { Footer } from './components/footer/footer';
import { MatIconRegistry } from '@angular/material/icon';
import { SystemNotificationQueue } from './components/system-notification-queue/system-notification-queue';

@Component({
  selector: 'app-root',
  standalone: true, // 2. Marcar como standalone
  imports: [RouterModule, Footer, SystemNotificationQueue],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('glitch_frontend');
  private readonly router = inject(Router);

  // 2. Injete o MatIconRegistry
  private matIconRegistry = inject(MatIconRegistry);

  // 3. Adicione o construtor para configurar a classe de fonte padrão
  constructor() {
    this.matIconRegistry.setDefaultFontSetClass('material-symbols-rounded');
  }

  isAuthRoute(): boolean {
    const basePath = this.router.url.split('?')[0].split('#')[0] || '/';
    const publicRoutes = new Set(['/', '/login', '/create-account']);
    return !publicRoutes.has(basePath);
  }
}
