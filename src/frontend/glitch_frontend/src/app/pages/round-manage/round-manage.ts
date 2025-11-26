import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from "../../components/button/button";
import { Navigation } from "../../components/navigation/navigation";
import { ThemeToggler } from "../../components/theme-toggler/theme-toggler";
import { CommonModule } from '@angular/common';
import { TournamentService } from '../../services/tournament-service';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { PartidaService } from '../../services/partida-service';

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
  imports: [ButtonComponent, Navigation, ThemeToggler, CommonModule],
  templateUrl: './round-manage.html',
  styleUrl: './round-manage.scss'
})
export class RoundManage implements OnInit {

  private id: string;

  private dadosPartidaSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null)
  dadosPartida: Observable<any> = this.dadosPartidaSubject.asObservable()

  private logsPartidaSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([])
  logsPartida: Observable<any[]> = this.logsPartidaSubject.asObservable()

  constructor(
    private torneioService: TournamentService,
    private notifService: SystemNotificationService,
    private activeRoute: ActivatedRoute,
    private partidaService: PartidaService,
    private router:Router
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
        console.log(res)
        this.dadosPartidaSubject.next(res)
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  buscarLogsPartida() {
    this.partidaService.buscarLogs(this.id).subscribe({
      next: (res) => {
        res.forEach((l: any) => {
          l.dt_log = new Date(l.dt_log);
        })
        this.logsPartidaSubject.next(res)
      },
      error: (err) => {
        console.log(err)
      }
    })
  }


  private alterarPlacar(jogador: any) {
    let dados = this.dadosPartidaSubject.getValue()
    let chaveamento = dados.chaveamentos[0]

    let pontuacao = 0;
    let letra_jogador = ''

    if (jogador == chaveamento.participante_a.id) {
      // foi o jogador A
      pontuacao = parseInt(chaveamento.placar_a)
      letra_jogador = 'A'
    } else {
      // foi o jogador B
      pontuacao = parseInt(chaveamento.placar_b)
      letra_jogador = 'B'
    }

    pontuacao += 100;
    console.log(pontuacao, letra_jogador)
    this.partidaService.alterarPlacar(jogador, chaveamento.id, pontuacao).subscribe({
      next: (res) => {
        console.log(res)
        this.notifService.notificar('sucesso', 'Pontuação alterada')
        if (letra_jogador == 'A') {
          dados.chaveamentos[0].placar_a = res.placar_a
        } else {
          dados.chaveamentos[0].placar_b = res.placar_b
        }

        this.dadosPartidaSubject.next(dados)

      },
      error: (error) => {
        console.log(error)
        this.notifService.notificar('erro', 'Não foi possível atualizar a pontuação')
      }
    })


  }

  registrarMorte(vitima: any, culpado: any) {
    this.computarMorte(vitima.usuario.nickname, culpado.usuario.nickname);
    this.alterarPlacar(culpado.id);
  }

  private computarMorte(vitima: string, culpado: string) {
    this.partidaService.computarMorte(vitima, culpado, this.id).subscribe({
      next: (res) => {
        let logs = this.logsPartidaSubject.getValue()

        res.dt_log = new Date(res.dt_log)

        logs.push(res)
        this.logsPartidaSubject.next(logs)
      },
      error: (err) => {
        console.log(err)
        this.notifService.notificar("erro", "Erro ao lançar evento")
      }
    })
  }

  encerrarPartida() {
    let dadosPartida = this.dadosPartidaSubject.getValue()

    let pontuacao_a = dadosPartida.chaveamentos[0].placar_a;
    let pontuacao_b = dadosPartida.chaveamentos[0].placar_b;

    if(pontuacao_a == pontuacao_b){
      this.notifService.notificar('aviso',"Não é possível encerrar empatado, vai aos acréscimos");
      return;
    }

    let participante_vencedor;

    if(pontuacao_a>pontuacao_b){
      participante_vencedor = dadosPartida.chaveamentos[0].participante_a.id
    }else{
      participante_vencedor = dadosPartida.chaveamentos[0].participante_b.id
    }

    let etapa = dadosPartida.etapa.id;
    let chaveamento = dadosPartida.chaveamentos[0].id;
    this.partidaService.finalizarPartida(etapa,this.id,chaveamento,participante_vencedor).subscribe({
      next:(res)=>{
        console.log(res)
        this.notifService.notificar('sucesso','Partida finalizada com sucesso!')
        this.router.navigate(['/tournaments']);
      },
      error:(err)=>{  
        console.log(err)
        this.notifService.notificar('erro','Erro ao finalizar')
      }
    })


  }

  iniciarPartida() {
    this.partidaService.iniciarPartida(this.id).subscribe({
      next: (res) => {
        this.notifService.notificar('info', 'Partida iniciada!')
        this.dadosPartidaSubject.next(res)
      },
      error: (err) => {
        console.log(err)
        this.notifService.notificar('erro', 'Erro ao iniciar a partida')
      }
    })
  }

}
