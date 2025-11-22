import { Component, OnInit } from '@angular/core';
import { Navigation } from "../../components/navigation/navigation";
import { ButtonComponent } from "../../components/button/button";
import { ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { TournamentService } from '../../services/tournament-service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { SystemNotificationComponent } from '../../components/system-notification/system-notification';
import { ChangeDetectorRef } from '@angular/core';
import { UsuarioService } from '../../services/usuario-service';
import { Observable, Subject } from 'rxjs';
import { SystemNotificationService } from '../../services/misc/system-notification-service';


@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [
    Navigation,
    ButtonComponent,
    ReactiveFormsModule,
    LucideAngularModule,
    RouterOutlet,
    CommonModule,
    AsyncPipe
  ],
  templateUrl: './tournament-list.html',
  styleUrls: ['./tournament-list.scss']
})

export class TournamentList implements OnInit {

  private tournamentSubject: Subject<any> = new Subject<any>();
  tournaments$: Observable<any> = this.tournamentSubject.asObservable();

  currentUser: string = '';
  mensagemAviso: string | null = null;
  tipoAviso: 'sucesso' | 'erro' | 'info' | 'aviso' = 'aviso';
  private mensagemTimeout: any;

  constructor(
    private router: Router,
    private tournamentService: TournamentService,
    private cdr: ChangeDetectorRef,
    private usuarioService: UsuarioService,
    private notifService: SystemNotificationService
  ) { }

  ngOnInit() {

    this.buscarTorneios();


    let usuario = this.usuarioService.getUsuarioLogado();
    if (usuario) {
      this.currentUser = usuario.nickname;
    }


  }

  private buscarTorneios() {
    this.tournamentService.getTournaments().subscribe({
      next: (res) => {
        console.log(res)
        res.forEach((t:any)=>{
          console.log(t.participantes)
          t.isMembro = t.participantes.filter((p:any)=>p.usuario.nickname == this.currentUser).length == 1
        })
        this.tournamentSubject.next(res)
      }
    })
  }

  gotCreateTournament() {
    this.router.navigate(['/tournaments/create-tournament']);
  }

  joinTournament(t: any) {
    this.tournamentService.ingressarTorneio(t,this.currentUser).subscribe({
      next:(res)=>{
        this.notifService.notificar("sucesso","Ingressou com sucesso!")
        this.notifService.notificar('info',"Quando chegar a data, você poderá participar do torneio.")
        this.buscarTorneios()
      },
      error:(err)=>{
        console.log(err)
        this.notifService.notificar('erro','Erro ao ingressar no torneio')
      }
    })
  }

  editTournament(t: string) {
    this.router.navigate([`/update-tournament/${t}`])
  }

  deleteTournament(t: any) {
    if (confirm("Deseja realmente remover esse torneio?")) {
      this.tournamentService.removeTorneio(t).subscribe({
        next: (res) => {
          this.notifService.notificar('sucesso', 'Torneio removido')
          this.buscarTorneios();
        },
        error: (err) => {
          console.log(err)
          this.notifService.notificar('erro', 'Erro ao remover')
        }
      })
    }

  }


  beginTournament(t:string){
    this.router.navigate([`/tournaments/manage/${t}`])
  }
}