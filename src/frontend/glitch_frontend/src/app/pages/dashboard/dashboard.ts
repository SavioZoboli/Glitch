import { Component, ViewEncapsulation } from '@angular/core';
import { Footer } from '../../components/footer/footer';
import { MatIconModule } from '@angular/material/icon';
import { Navigation } from "../../components/navigation/navigation";
import { TeamInviteBoxComponent } from "../../components/team-invite-box-component/team-invite-box-component";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
    MatIconModule,
    Navigation,
    TeamInviteBoxComponent
]
})
export class DashboardComponent {
    playerName = 'Jogador';
    lastTournament = 'CS 2 - WORLD CUP 2023';
}
