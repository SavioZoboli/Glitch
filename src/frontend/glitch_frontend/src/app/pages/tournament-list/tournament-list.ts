import { Component, OnInit } from '@angular/core';
import { Navigation } from "../../components/navigation/navigation";
import { ButtonComponent } from "../../components/button/button";
import { ReactiveFormsModule} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { TournamentService, Tournament } from '../../services/tournament-service';
import { CommonModule } from '@angular/common';
import { SystemNotificationComponent } from '../../components/system-notification/system-notification';
import { ChangeDetectorRef } from '@angular/core';


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
    SystemNotificationComponent
],
  templateUrl: './tournament-list.html',
  styleUrls: ['./tournament-list.scss']
})
export class TournamentList implements OnInit {
  tournaments: Tournament[] = [];
  currentUser: string = '';
  mensagemAviso: string | null = null;
  tipoAviso: 'sucesso' | 'erro' | 'info' | 'aviso' = 'aviso';
  private mensagemTimeout: any;

  constructor(
    private router: Router,
    private tournamentService: TournamentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.tournaments = this.tournamentService.getTournaments() ?? [];

    this.currentUser = localStorage.getItem('username') || 'JogadorTeste';
  }

  gotCreateTournament() {
    this.router.navigate(['/tournaments/create-tournament']);
  }

  joinTournament(t: Tournament) {
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

  editTournament(t: Tournament) {
    console.log('Editando torneio:', t.nome_torneio);
  }

  deleteTournament(t: Tournament) {
    console.log('Excluindo torneio:', t.nome_torneio);
  }
}