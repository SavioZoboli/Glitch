import { CommonModule } from '@angular/common';
import { Component, HostBinding, OnInit } from '@angular/core';
import { EquipeService } from '../../services/equipe-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import { ButtonComponent } from '../button/button';
import { MatIconModule } from '@angular/material/icon';
import { UsuarioService } from '../../services/usuario-service';

@Component({
  selector: 'app-team-invite-box-component',
  imports: [CommonModule, ButtonComponent, MatIconModule],
  templateUrl: './team-invite-box-component.html',
  styleUrl: './team-invite-box-component.scss',
})
export class TeamInviteBoxComponent implements OnInit {
  @HostBinding('class')
  get hostClasses(): string {
    return 'team-invite-box';
  }

  private readonly convitesSubject = new BehaviorSubject<any[]>([]);

  // 3. O Observable (público) que seu componente usará
  // (Usamos .asObservable() para que ninguém de fora possa dar .next())
  public readonly convites$: Observable<any[]> =
    this.convitesSubject.asObservable();

  convitesRecebidos: any[] = [];
  solicitacoesPendentes: any[] = [];

  constructor(
    private equipeService: EquipeService,
    private sysNotifService: SystemNotificationService,
    private usuarioService: UsuarioService,
  ) {}

  public carregarConvites(): void {
    this.equipeService.getConvites().subscribe({
      next: (equipes) => {
        this.convitesSubject.next(equipes);

        this.convitesRecebidos = equipes.flatMap((e: any) =>
          e.associacoesMembro
            .filter((m: any) => m.tipo === 'convite')
            .map((m: any) => ({ ...m, equipeId: e.id, equipeNome: e.nome })),
        );

        this.solicitacoesPendentes = equipes.flatMap((e: any) =>
          e.associacoesMembro
            .filter((m: any) => m.tipo === 'solicitacao')
            .map((m: any) => ({ ...m, equipeId: e.id, equipeNome: e.nome })),
        );
      },
    });
  }

  ngOnInit(): void {
    this.carregarConvites();
  }

  aceitarConvite(equipeId: string, usuarioAlvo: string) {
    this.equipeService.aceitarConvite(equipeId, usuarioAlvo).subscribe({
      next: (res) => {
        this.sysNotifService.notificar('sucesso', 'Aceito com sucesso');
        console.log('Convite aceito');
        this.carregarConvites();
        this.equipeService.carregarEquipes();
      },
      error: (err) => {
        console.log(err);
        this.sysNotifService.notificar('erro', 'Erro ao aceitar');
      },
    });
  }

  recusarConvite(equipeId: string, usuarioAlvo: string) {
    this.equipeService.recusarConvite(equipeId, usuarioAlvo).subscribe({
      next: (res) => {
        this.sysNotifService.notificar('sucesso', 'Recusado com sucesso');
        this.carregarConvites();
        this.equipeService.carregarEquipes();
        console.log('Convite recusado');
      },
      error: (err) => {
        console.log(err);
        this.sysNotifService.notificar('erro', 'Erro ao recusar');
      },
    });
  }

  obterAvatarMembroConvite(membro: any): string {
    const origem = membro?.membro ?? membro?.usuario ?? membro ?? {};
    const avatar =
      origem?.avatarUrl ??
      origem?.avatar_url ??
      origem?.usuario?.avatarUrl ??
      origem?.usuario?.avatar_url ??
      null;

    return this.usuarioService.obterAvatarComFallback(avatar);
  }
}
