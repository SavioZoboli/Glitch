import { Component, OnInit } from '@angular/core';
import { Navigation } from '../../components/navigation/navigation';
import { ButtonComponent } from '../../components/button/button';
import { ThemeToggler } from '../../components/theme-toggler/theme-toggler';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

interface Jogador {
  id: number;
  nickname: string;
  morto: boolean;   
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

  pontuacaoTime1 = 0;
  pontuacaoTime2 = 0;

  jogadoresTime1: Jogador[] = [
    { id: 1, nickname: 'PlayerA', morto: false },
    { id: 2, nickname: 'PlayerB', morto: false },
  ];

  jogadoresTime2: Jogador[] = [
    { id: 3, nickname: 'PlayerC', morto: false },
    { id: 4, nickname: 'PlayerD', morto: false },
  ];

  eventos: Evento[] = [];

  vencedor: string | null = null;
  partidaFinalizada = false;

  mostrarModalCancelar = false;

  ngOnInit() {}

  alterarPlacar(time: number, valor: number) {
    if (time === 1) {
      this.pontuacaoTime1 = Math.max(0, this.pontuacaoTime1 + valor);
    } else {
      this.pontuacaoTime2 = Math.max(0, this.pontuacaoTime2 + valor);
    }
  }

  registrarMorte(jogador: Jogador, time: number) {
    if (jogador.morto) {
      return;
    }

    jogador.morto = true;

    const hora = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    this.eventos.unshift({
      texto: `${jogador.nickname} foi eliminado`,
      hora,
    });
  }

  finalizarPartida() {
    if (this.pontuacaoTime1 > this.pontuacaoTime2) {
      this.vencedor = `${this.time1Nome} venceu!`;
    } else if (this.pontuacaoTime2 > this.pontuacaoTime1) {
      this.vencedor = `${this.time2Nome} venceu!`;
    } else {
      this.vencedor = 'A partida terminou empatada!';
    }

    this.partidaFinalizada = true;
  }

  cancelarPartida() {
    this.mostrarModalCancelar = true;
  }

  resetarPartida() {
    this.pontuacaoTime1 = 0;
    this.pontuacaoTime2 = 0;

    this.jogadoresTime1.forEach(j => j.morto = false);
    this.jogadoresTime2.forEach(j => j.morto = false);

    this.eventos = [];
    this.vencedor = null;
    this.partidaFinalizada = false;

    this.mostrarModalCancelar = false;
  }

  cancelarDeVez() {
    this.mostrarModalCancelar = false;
    window.location.href = '/tournaments'; 
  }

}
