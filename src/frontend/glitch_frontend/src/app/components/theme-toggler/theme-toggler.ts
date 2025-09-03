import { Component } from '@angular/core';
import { Themes } from '../../services/misc/themes';

@Component({
  selector: 'app-theme-toggler',
  standalone: false,
  templateUrl: './theme-toggler.html',
  styleUrl: './theme-toggler.scss'
})
export class ThemeToggler {

  theme:'light'|'dark'

  constructor(private themeService:Themes){
    this.theme = this.themeService.getCurrentTheme();
  }


  toggle(){
    this.themeService.toggleTheme();
    this.theme = this.themeService.getCurrentTheme();
  }
}
