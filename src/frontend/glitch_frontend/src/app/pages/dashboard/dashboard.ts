import { Component, ViewEncapsulation } from '@angular/core';
import { Footer } from '../../components/footer/footer';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        Footer,
        MatIconModule
    ]
})
export class DashboardComponent {
    playerName = 'Jogador';
    lastTournament = 'CS 2 - WORLD CUP 2023';
}
