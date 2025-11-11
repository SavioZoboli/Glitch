import { Component, OnInit } from '@angular/core';
import { Navigation } from "../../components/navigation/navigation";
import { ButtonComponent } from "../../components/button/button";
import { ReactiveFormsModule} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { TournamentService, Tournament } from '../../services/tournament-service';
import { CommonModule } from '@angular/common';

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
],
  templateUrl: './tournament-list.html',
  styleUrls: ['./tournament-list.scss']
})
export class TournamentList implements OnInit {
  tournaments: Tournament[] = [];
  currentUser: string = '';

  constructor(
    private router: Router,
    private tournamentService: TournamentService
  ) {}

  ngOnInit() {
    this.tournaments = this.tournamentService.getTournaments() ?? [];

    this.currentUser = localStorage.getItem('username') || 'JogadorTeste';
  }

  gotCreateTournament() {
    this.router.navigate(['/tournaments/create-tournament']);
  }

  joinTournament(t: Tournament) {
    if (t.criador === this.currentUser) {
      console.warn('O criador não pode ingressar no próprio torneio.');
      return;
    }
    console.log(`${this.currentUser} ingressou no torneio: ${t.nome_torneio}`);
  }

  editTournament(t: Tournament) {
    console.log('Editando torneio:', t.nome_torneio);
  }

  deleteTournament(t: Tournament) {
    console.log('Excluindo torneio:', t.nome_torneio);
  }
}
