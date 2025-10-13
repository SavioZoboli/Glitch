import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Carrousel } from "../../components/carrousel/carrousel";


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



}
