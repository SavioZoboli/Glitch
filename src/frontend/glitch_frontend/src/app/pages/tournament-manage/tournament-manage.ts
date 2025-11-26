import { Component, OnInit } from '@angular/core';
import { Navigation } from '../../components/navigation/navigation';
import { ButtonComponent } from '../../components/button/button';
import { ThemeToggler } from '../../components/theme-toggler/theme-toggler';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';



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
    { id: 1, nickname: 'PlayerA', morto: false },
    { id: 2, nickname: 'PlayerB', morto: false },
  ];

  jogadoresTime2: Jogador[] = [
    { id: 3, nickname: 'PlayerC', morto: false },
    { id: 4, nickname: 'PlayerD', morto: false },
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

  buscaPartidas() {
    this.tournamentService.getPartidasDoTorneio(this.id).subscribe({
      next: (res) => {
        res.forEach((e:any)=>{
          e.partidas.forEach((p:any)=>{
            p.data_inicio = new Date(p.data_inicio)
          })
        })
        console.log(res)
        this.arrPartidasSubject.next(res)
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  gerarPartidas() {
    this.tournamentService.gerarPartidas(this.id).subscribe({
      next: (res) => {
        console.log(res)
        this.notifService.notificar('sucesso', "Gerado com sucesso")
        this.notifService.notificar('info', 'Buscando dados gerados')
        this.buscaPartidas();
      },
      error: (err) => {
        this.notifService.notificar('erro',err.error.message)
        console.log(err)
      }
    })
  }

  goToPartida(partida:string){
    this.router.navigate([`/tournaments/manage/round/${partida}`])
  }

  finalizarEtapa(etapa_id:string){
    console.log(etapa_id)
    this.partidaService.finalizarEtapa(etapa_id).subscribe({
      next:(res)=>{
        this.notifService.notificar("sucesso",'Etapa finalizada')
        this.notifService.notificar('info',"Atualizando lista...")
        this.buscaPartidas()
      },
      error:(err)=>{
        this.notifService.notificar("erro","Erro ao finalizar etapa")
        console.log(err)
      }
    })
  }

  finalizarTorneio(torneio:string){
    this.tournamentService.finalizarTorneio(torneio).subscribe({
      next:(res)=>{
        this.notifService.notificar('sucesso','Torneio finalizado com sucesso')
        this.notifService.notificar('info','Voltando para a lista de torneios...')
        this.router.navigate(['/tournaments'])
      },
      error:(err)=>{
        this.notifService.notificar('erro','Erro ao finalizar torneio')
        console.log(err)
      }
    })
  }
}
