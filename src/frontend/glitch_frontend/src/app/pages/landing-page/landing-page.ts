import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Carrousel } from "../../components/carrousel/carrousel";
import { Observable, Subject } from 'rxjs';
import { TournamentService } from '../../services/tournament-service';


@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule,
    Carrousel
],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPageComponent {
private tournamentSubject: Subject<any> = new Subject<any>();
  tournaments$: Observable<any> = this.tournamentSubject.asObservable();

  constructor(
    private tournamentService:TournamentService
  ){
    this.buscarTorneios()
  }


  private buscarTorneios() {
    this.tournamentService.getTournaments().subscribe({
      next: (res) => {
        console.log(res)
        res = res.filter((t:any)=>!t.dt_fim)
        this.tournamentSubject.next(res)
      }
    })
  }


}
