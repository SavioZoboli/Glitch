import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from '../../components/button/button';
import { Navigation } from '../../components/navigation/navigation';
import { ThemeToggler } from '../../components/theme-toggler/theme-toggler';
import { CommonModule } from '@angular/common';
import { TournamentService } from '../../services/tournament-service';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { PartidaService } from '../../services/partida-service';
import { MatIcon } from '@angular/material/icon';

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
  selector: 'app-round-manage',
  imports: [ButtonComponent, Navigation, CommonModule, MatIcon],
  templateUrl: './round-manage.html',
  styleUrl: './round-manage.scss',
})
export class RoundManage implements OnInit {
  private id: string;

  private dadosPartidaSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null,
  );
  dadosPartida: Observable<any> = this.dadosPartidaSubject.asObservable();

  private logsPartidaSubject: BehaviorSubject<any[]> = new BehaviorSubject<
    any[]
  >([]);
  logsPartida: Observable<any[]> = this.logsPartidaSubject.asObservable();

  constructor(
    private torneioService: TournamentService,
    private notifService: SystemNotificationService,
    private activeRoute: ActivatedRoute,
    private partidaService: PartidaService,
    private router: Router,
  ) {
    this.id = this.activeRoute.snapshot.paramMap.get('id') || '';
  }

  ngOnInit() {
    this.buscarDadosPartida();
    this.buscarLogsPartida();
  }

  buscarDadosPartida() {
    this.torneioService.buscarPartidaPorId(this.id).subscribe({
      next: (res) => {
        console.log(res);
        this.dadosPartidaSubject.next(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  buscarLogsPartida() {
    this.partidaService.buscarLogs(this.id).subscribe({
      next: (res) => {
        res.forEach((l: any) => {
          l.dt_log = new Date(l.dt_log);
        });
        console.log(res);
        this.logsPartidaSubject.next(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  private alterarPlacar(nicknameJogador: string) {
    const dados = this.dadosPartidaSubject.getValue();
    const chaveamento = dados.chaveamentos[0];

    let pontuacaoAtual = 0;
    let ladoAlvo: 'A' | 'B' | null = null;
    let participanteId: string | null = null;

    // 1. Identifica o lado (A ou B) e o Participante_ID
    // Tentativa pelo Lado A
    const isLadoA = this.verificarPertencimento(
      chaveamento.participante_a,
      nicknameJogador,
    );

    if (isLadoA) {
      ladoAlvo = 'A';
      participanteId = chaveamento.participante_a_id;
      pontuacaoAtual = parseInt(chaveamento.placar_a) || 0;
    } else {
      // Tentativa pelo Lado B
      const isLadoB = this.verificarPertencimento(
        chaveamento.participante_b,
        nicknameJogador,
      );
      if (isLadoB) {
        ladoAlvo = 'B';
        participanteId = chaveamento.participante_b_id;
        pontuacaoAtual = parseInt(chaveamento.placar_b) || 0;
      }
    }

    // 2. Validação de segurança
    if (!ladoAlvo || !participanteId) {
      console.error(
        `Jogador ${nicknameJogador} não vinculado a nenhum participante desta partida.`,
      );
      this.notifService.notificar(
        'erro',
        'Jogador não identificado na partida.',
      );
      return;
    }

    // 3. Cálculo da nova pontuação (+100)
    const novaPontuacao = pontuacaoAtual + 100;

    // 4. Chamada ao Service enviando o PARTICIPANTE_ID
    this.partidaService
      .alterarPlacar(participanteId, chaveamento.id, novaPontuacao)
      .subscribe({
        next: (res) => {
          this.notifService.notificar('sucesso', 'Pontuação atualizada (+100)');

          // Atualiza o estado local para refletir no placar imediatamente
          if (ladoAlvo === 'A') {
            dados.chaveamentos[0].placar_a = res.placar_a;
          } else {
            dados.chaveamentos[0].placar_b = res.placar_b;
          }

          this.dadosPartidaSubject.next(dados);
        },
        error: (error) => {
          console.error(error);
          this.notifService.notificar(
            'erro',
            'Falha ao sincronizar placar com o servidor.',
          );
        },
      });
  }

  /**
   * Helper para detectar se o nickname pertence ao participante (Solo ou Equipe)
   */
  private verificarPertencimento(participante: any, nickname: string): boolean {
    // Caso Individual
    if (participante.usuario) {
      return participante.usuario.nickname === nickname;
    }
    // Caso Equipe
    if (participante.equipe?.membros) {
      return participante.equipe.membros.some(
        (m: any) => m.nickname === nickname,
      );
    }
    return false;
  }

  registrarMorte(vitima: any, culpado: any) {
    this.computarMorte(vitima, culpado);
    this.alterarPlacar(culpado);
  }

  private computarMorte(vitima: string, culpado: string) {
    this.partidaService.computarMorte(vitima, culpado, this.id).subscribe({
      next: (res) => {
        let logs = this.logsPartidaSubject.getValue();

        res.dt_log = new Date(res.dt_log);

        logs.push(res);
        this.logsPartidaSubject.next(logs);
      },
      error: (err) => {
        console.log(err);
        this.notifService.notificar('erro', 'Erro ao lançar evento');
      },
    });
  }

  encerrarPartida() {
    let dadosPartida = this.dadosPartidaSubject.getValue();

    let pontuacao_a = dadosPartida.chaveamentos[0].placar_a;
    let pontuacao_b = dadosPartida.chaveamentos[0].placar_b;

    if (pontuacao_a == pontuacao_b) {
      this.notifService.notificar(
        'aviso',
        'Não é possível encerrar empatado, vai aos acréscimos',
      );
      return;
    }

    let participante_vencedor;

    if (pontuacao_a > pontuacao_b) {
      participante_vencedor = dadosPartida.chaveamentos[0].participante_a.id;
    } else {
      participante_vencedor = dadosPartida.chaveamentos[0].participante_b.id;
    }

    let etapa = dadosPartida.etapa.id;
    let chaveamento = dadosPartida.chaveamentos[0].id;
    this.partidaService
      .finalizarPartida(etapa, this.id, chaveamento, participante_vencedor)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.notifService.notificar(
            'sucesso',
            'Partida finalizada com sucesso!',
          );
          this.router.navigate(['/tournaments']);
        },
        error: (err) => {
          console.log(err);
          this.notifService.notificar('erro', 'Erro ao finalizar');
        },
      });
  }

  iniciarPartida() {
    this.partidaService.iniciarPartida(this.id).subscribe({
      next: (res) => {
        this.notifService.notificar('info', 'Partida iniciada!');
        this.dadosPartidaSubject.next(res);
      },
      error: (err) => {
        console.log(err);
        this.notifService.notificar('erro', 'Erro ao iniciar a partida');
      },
    });
  }

  selectedKillerId: string | null = null;

  selectKiller(nickname: string) {
    this.selectedKillerId = nickname;
    console.log(nickname);
  }

  registrarMorteRapida(vitima: string, timeVitima: 'A' | 'B') {
    if (!this.selectedKillerId) {
      this.notifService.notificar('aviso', 'Selecione primeiro QUEM matou!');
      return;
    }

    this.alterarPlacar(this.selectedKillerId);

    // Se o assassino e a vítima forem do mesmo time (opcional dependendo da regra)
    // if (this.isMesmoTime(this.selectedKillerId, vitimaId)) { ... }

    this.partidaService
      .computarMorte(vitima, this.selectedKillerId, this.id)
      .subscribe({
        next: (res) => {
          let logs = this.logsPartidaSubject.getValue();

          res.dt_log = new Date(res.dt_log);

          logs.push(res);
          this.logsPartidaSubject.next(logs);
        },
        error: (err) => {
          console.log(err);
          this.notifService.notificar('erro', 'Erro ao lançar evento');
        },
      });
  }
}
