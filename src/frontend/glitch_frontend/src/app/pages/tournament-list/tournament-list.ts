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
    this.tournamentService.getTournaments().subscribe({
      next: (res) => {
        console.log(res)
        this.tournamentSubject.next(res)
      }
    })

    let usuario = this.usuarioService.getUsuarioLogado();
    if (usuario) {
      this.currentUser = usuario.nickname;
    }


  }

  gotCreateTournament() {
    this.router.navigate(['/tournaments/create-tournament']);
  }

  joinTournament(t: any) {
    console.log('joinTournament chamado!', t);

    if (t.criador === this.currentUser) {
      this.tipoAviso = 'erro';
      this.mensagemAviso = 'Você não pode ingressar no seu próprio torneio.';
    } else {
      this.tipoAviso = 'sucesso';
      this.mensagemAviso = `Você ingressou no torneio "${t.nome_torneio}"!`;
    }

    this.cdr.detectChanges();

    clearTimeout(this.mensagemTimeout);
    this.mensagemTimeout = setTimeout(() => {
      this.mensagemAviso = null;
      this.cdr.detectChanges();
    }, 4000);

  }

  editTournament(t: any) {
    console.log('Editando torneio:', t.nome_torneio);
  }

  deleteTournament(t: any) {
    if (confirm("Deseja realmente remover esse torneio?")) {
      this.tournamentService.removeTorneio(t).subscribe({
        next: (res) => {
          this.notifService.notificar('sucesso', 'Torneio removido')
        },
        error: (err) => {
          console.log(err)
          this.notifService.notificar('erro', 'Erro ao remover')
        }
      })
    }

  }
}