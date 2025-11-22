import { Component, OnInit } from '@angular/core';
import { Navigation } from '../../components/navigation/navigation';
import { ButtonComponent } from '../../components/button/button';
import { ThemeToggler } from '../../components/theme-toggler/theme-toggler';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

interface Jogador {
  id: number;
  nickname: string;
}

interface Evento {
  texto: string;
  hora: string;
}

@Component({
  selector: 'app-tournament-manage',
  standalone: true,
  imports: [CommonModule, Navigation, ButtonComponent, ThemeToggler, RouterOutlet],
  templateUrl: './tournament-manage.html',
  styleUrls: ['./tournament-manage.scss'],
})
export class TournamentManage implements OnInit {
  nomeDoTorneio = 'GLITCH CHAMPIONS';
  time1Nome = 'TIME 1';
  time2Nome = 'TIME 2';

  pontuacaoTime1 = 1;
  pontuacaoTime2 = 2;

  jogadoresTime1: Jogador[] = [
    { id: 1, nickname: 'PlayerA' },
    { id: 2, nickname: 'PlayerB' },
  ];

  jogadoresTime2: Jogador[] = [
    { id: 3, nickname: 'PlayerC' },
    { id: 4, nickname: 'PlayerD' },
  ];

  eventos: Evento[] = [];

  ngOnInit() {}

  alterarPlacar(time: number, valor: number) {
    if (time === 1) {
      this.pontuacaoTime1 = Math.max(0, this.pontuacaoTime1 + valor);
    } else {
      this.pontuacaoTime2 = Math.max(0, this.pontuacaoTime2 + valor);
    }
  }

  registrarMorte(jogador: Jogador, time: number) {
    const hora = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    this.eventos.unshift({
      texto: `${jogador.nickname} foi eliminado`,
      hora,
    });
  }
}
