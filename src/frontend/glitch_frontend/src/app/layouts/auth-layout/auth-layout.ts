import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navigation } from '../../components/navigation/navigation';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, Navigation],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayoutComponent {}
