import { Component } from '@angular/core';
import { Navigation } from "../../components/navigation/navigation";
import { ButtonComponent } from "../../components/button/button";
import {  ReactiveFormsModule} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [
    Navigation,
    ButtonComponent,
    ReactiveFormsModule,
    LucideAngularModule,
    RouterOutlet
    ,
],
  templateUrl: './tournament-list.html',
  styleUrls: ['./tournament-list.scss']
})
export class TournamentList {
  constructor(private router: Router) {}
  gotCreateTournament() {
  this.router.navigate(['/tournaments/create-tournament']);
}
  }
