import { CommonModule } from '@angular/common';
import { Component, HostBinding, OnInit } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { EquipeService } from '../../services/equipe-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { SystemNotificationService } from '../../services/misc/system-notification-service';

@Component({
  selector: 'app-team-invite-box-component',
  imports: [CommonModule, MatIcon],
  templateUrl: './team-invite-box-component.html',
  styleUrl: './team-invite-box-component.scss'
})
export class TeamInviteBoxComponent implements OnInit{
// Isso é crucial:
  // Ele adiciona a classe 'team-invite-box' ao elemento host (<app-team-invite-box>)
  // Isso fará com que o CSS Grid o posicione na área "invites".
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
  public readonly convites$: Observable<any[]> = this.convitesSubject.asObservable();

  constructor(private equipeService:EquipeService,private sysNotifService:SystemNotificationService){}

  // 5. Método para buscar os dados e ATUALIZAR o Subject
  public carregarConvites(): void {
    this.equipeService.getConvites().subscribe({
      next:(res)=>{
        this.convitesSubject.next(res);
      }
    })
  }


  ngOnInit(): void {
    this.carregarConvites()
  }

  // (Lógica para aceitar/recusar)
  aceitarConvite(id: string) {
    this.equipeService.aceitarConvite(id).subscribe({
      next:(res)=>{
        this.sysNotifService.notificar('sucesso','Aceito com sucesso')
        this.carregarConvites()
      },
      error:(err)=>{
        console.log(err)
        this.sysNotifService.notificar('erro','Erro ao aceitar')
      }
    })
  }

  recusarConvite(id: string) {
    this.equipeService.recusarConvite(id).subscribe({
      next:(res)=>{
        this.sysNotifService.notificar('sucesso','Recusado com sucesso')
        this.carregarConvites()
      },
      error:(err)=>{
        console.log(err)
        this.sysNotifService.notificar('erro','Erro ao recusar')
      }
    })
  }
}
