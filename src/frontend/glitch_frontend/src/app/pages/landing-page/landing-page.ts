import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-landing-page',
  standalone: true,
    imports: [MatIconModule, RouterModule],

  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage {



}
