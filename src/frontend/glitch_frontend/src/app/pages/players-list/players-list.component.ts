import { Component, OnInit } from '@angular/core';
import { InputComponent } from '../../components/input/input';
import { ButtonComponent } from '../../components/button/button';
import { Footer } from '../../components/footer/footer';
import { ThemeToggler } from '../../components/theme-toggler/theme-toggler';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../components/navigation/navigation';
import { UsuarioService } from '../../services/usuario-service'; // ✅ import do service

@Component({
  selector: 'app-players-list',
  standalone: true,
  imports: [InputComponent, ButtonComponent, Footer, ThemeToggler, FormsModule, CommonModule, Navigation],
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.scss']
})
export class PlayersListComponent implements OnInit {

  jogadores: any[] = [];
  searchTerm: string = '';

  constructor(private usuarioService: UsuarioService) {} 

  ngOnInit(): void {
    this.buscarUsuarios(); 
  }

  buscarUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: (res) => {
        this.jogadores = res;
        console.log('Jogadores carregados:', this.jogadores);
      },
      error: (err) => {
        console.error('Erro ao buscar jogadores:', err);
      }
    });
  }

  filteredPlayers() {
    return this.jogadores.filter(player =>
      player.nome.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
