import { Component, ViewEncapsulation } from '@angular/core';
import { Footer } from '../../components/footer/footer';
import { MatIconModule } from '@angular/material/icon';
import { Navigation } from "../../components/navigation/navigation";
import { TeamInviteBoxComponent } from "../../components/team-invite-box-component/team-invite-box-component";
import { TournamentService } from '../../services/tournament-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
    MatIconModule,
    Navigation,
    TeamInviteBoxComponent,
    AsyncPipe
]
})
export class DashboardComponent {
    playerName = 'Jogador';
    private torneiosInscritosSubject:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
    torneiosInscritos:Observable<any[]> = this.torneiosInscritosSubject.asObservable();

constructor(
    private torneioService:TournamentService

){
    this.buscarRelatorioDeTorneios()
}


buscarRelatorioDeTorneios(){
    this.torneioService.buscarTorneiosDoUsuario().subscribe({
        next:(res)=>{
            res.forEach((t:any)=>{
                t.data_realizacao = new Date(t.data_realizacao)
            })
            this.torneiosInscritosSubject.next(res)
        },
        error:(err)=>{
            console.log(err)
        }
    })
}

}
