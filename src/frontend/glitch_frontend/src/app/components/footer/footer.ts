import { Component } from '@angular/core';
import { ThemeToggler } from "../theme-toggler/theme-toggler";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [ThemeToggler],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {

}
