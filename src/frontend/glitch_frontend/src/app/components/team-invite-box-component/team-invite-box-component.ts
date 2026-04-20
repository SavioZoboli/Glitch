import { CommonModule } from '@angular/common';
import { Component, HostBinding, OnInit } from '@angular/core';
import { EquipeService } from '../../services/equipe-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import { ButtonComponent } from '../button/button';
import { MatIconModule } from '@angular/material/icon';

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

  // Você pode popular isso via um Input() ou buscando de um serviço
  convites = [
    { id: 1, teamName: 'Os Campeões' },
    { id: 2, teamName: 'Esquadrão Relâmpago' },
    { id: 3, teamName: 'Pro Players BR' },
  ];

  private readonly convitesSubject = new BehaviorSubject<any[]>([]);

  // 3. O Observable (público) que seu componente usará
  // (Usamos .asObservable() para que ninguém de fora possa dar .next())
  public readonly convites$: Observable<any[]> =
    this.convitesSubject.asObservable();

  constructor(
    private equipeService: EquipeService,
    private sysNotifService: SystemNotificationService,
  ) {}

  // 5. Método para buscar os dados e ATUALIZAR o Subject
  public carregarConvites(): void {
    this.equipeService.getConvites().subscribe({
      next: (res) => {
        this.convitesSubject.next(res);
      },
    });
  }

  ngOnInit(): void {
    this.carregarConvites();
  }

 aceitarConvite(id: string) {
  this.equipeService.aceitarConvite(id).subscribe({
    next: (res) => {
      this.sysNotifService.notificar('sucesso', 'Aceito com sucesso');
      console.log('Convite aceito');
      this.carregarConvites();
    },
    error: (err) => {
      console.log(err);
      this.sysNotifService.notificar('erro', 'Erro ao aceitar');
    },
  });
}

recusarConvite(id: string) {
  this.equipeService.recusarConvite(id).subscribe({
    next: (res) => {
      this.sysNotifService.notificar('sucesso', 'Recusado com sucesso');
      this.carregarConvites();
      console.log('Convite recusado');
    },
    error: (err) => {
      console.log(err);
      this.sysNotifService.notificar('erro', 'Erro ao recusar');
    },
  });
}
}
