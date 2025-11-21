import { Component, OnInit } from '@angular/core';
import { Navigation } from '../../components/navigation/navigation';
import { ButtonComponent } from '../../components/button/button';
import { ThemeToggler } from '../../components/theme-toggler/theme-toggler';
import { SystemNotificationComponent } from '../../components/system-notification/system-notification';
import { CommonModule } from '@angular/common';

interface Notificacao {
  tipo: 'sucesso' | 'erro' | 'info' | 'aviso';
  msg: string;
}

@Component({
  selector: 'app-tournament-control',
  standalone: true,
  imports: [
    CommonModule,
    Navigation,
    ButtonComponent,
    ThemeToggler,
    SystemNotificationComponent,
  ],
  templateUrl: './tournament-control.html',
  styleUrls: ['./tournament-control.scss'],
})
export class TournamentControl implements OnInit {

  nomeDoTorneio = 'GLITCH CHAMPIONS';
  chave = 'Quartas de Final';
  modoJogo = '5x5 Eliminatória';

  time1Nome = 'TIME 1';
  time2Nome = 'TIME 2';

  pontuacaoTime1 = 1;
  pontuacaoTime2 = 2;

  tempoRestante = '00:00';

  avatarUrl = 'https://cdn-icons-png.flaticon.com/512/147/147144.png';
  seuTime = 'Time 1';
  suaPontuacao = 0;

  servidor = 'BR01 - TOUR';
  servidorOnline = true;
  discordOnline = false;

  notificacoes: Notificacao[] = [
    { tipo: 'info', msg: 'Partida prestes a começar' },
    { tipo: 'sucesso', msg: 'Você entrou na sala' },
  ];

  ngOnInit() {
    this.simularTimer();
  }

  marcarPronto() {
    this.notificacoes.push({ tipo: 'sucesso', msg: 'Status: PRONTO' });
  }

  desistir() {
    this.notificacoes.push({ tipo: 'aviso', msg: 'Você desistiu da partida' });
  }

  simularTimer() {
    let seg = 5;

    const timer = setInterval(() => {
      this.tempoRestante = `00:0${seg}`;
      seg--;

      if (seg < 0) {
        this.tempoRestante = '00:00';
        clearInterval(timer);
      }
    }, 1000);
  }
}
