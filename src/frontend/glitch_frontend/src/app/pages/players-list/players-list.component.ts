import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InputComponent } from '../../components/input/input';
import { ButtonComponent } from '../../components/button/button';
import { Footer } from '../../components/footer/footer';
import { ThemeToggler } from '../../components/theme-toggler/theme-toggler';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../components/navigation/navigation';

@Component({
  selector: 'app-players-list',
  standalone: true,
  imports: [InputComponent, ButtonComponent, Footer, ThemeToggler, FormsModule, CommonModule, Navigation],
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.scss']
})
export class PlayersListComponent {
  jogadores: any[] = [];
  searchTerm: string = '';

  filteredPlayers() {
    return this.jogadores.filter(player =>
      player.nome.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
