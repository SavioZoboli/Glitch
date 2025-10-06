import { Component } from '@angular/core';
import { Themes } from '../../services/misc/themes';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-theme-toggler',
  standalone: true,
  imports:[
    MatIconModule
  ],
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
