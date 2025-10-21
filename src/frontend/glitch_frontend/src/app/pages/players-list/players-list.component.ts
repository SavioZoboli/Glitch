import { Component, OnInit } from '@angular/core';
import { InputComponent } from '../../components/input/input';
import { ButtonComponent } from '../../components/button/button';
import { Footer } from '../../components/footer/footer';
import { ThemeToggler } from '../../components/theme-toggler/theme-toggler';
import { FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../components/navigation/navigation';
import { Usuario, UsuarioService } from '../../services/usuario-service'; // ✅ import do service
import { catchError, EMPTY, Observable } from 'rxjs';

@Component({
  selector: 'app-players-list',
  standalone: true,
  imports: [InputComponent, ButtonComponent, ThemeToggler, FormsModule, CommonModule, Navigation],
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.scss']
})
export class PlayersListComponent implements OnInit {
// A variável agora armazena o Observable, e não o array.
  jogadores$!: Observable<Usuario[]>;
  filtroControl: FormControl = new FormControl('');

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.buscarUsuarios();
  }

  buscarUsuarios(): void {
    this.jogadores$ = this.usuarioService.getUsuarios().pipe(
      catchError(err => {
        // Se ocorrer um erro na API, podemos logar e retornar um array vazio.
        // Isso evita que a tela quebre se a chamada falhar.
        console.error('Erro ao buscar jogadores:', err);
        return EMPTY; // ou return of([]); se preferir emitir um array vazio.
      })
    );
  }
}
