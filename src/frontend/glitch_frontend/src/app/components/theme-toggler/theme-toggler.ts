import { Component } from '@angular/core';
import { Themes } from '../../services/misc/themes';

@Component({
  selector: 'app-theme-toggler',
  standalone: false,
  templateUrl: './theme-toggler.html',
  styleUrl: './theme-toggler.scss'
})
export class ThemeToggler {

  constructor(private themeService:Themes){

  }

  toggle(){
    this.themeService.toggleTheme();
  }
}
