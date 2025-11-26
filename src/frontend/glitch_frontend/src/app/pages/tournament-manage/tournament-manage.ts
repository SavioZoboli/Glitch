import { Component, OnInit } from '@angular/core';
import { Navigation } from '../../components/navigation/navigation';
import { ButtonComponent } from '../../components/button/button';
import { ThemeToggler } from '../../components/theme-toggler/theme-toggler';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { TournamentService } from '../../services/tournament-service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import { PartidaService } from '../../services/partida-service';



@Component({
  selector: 'app-tournament-manage',
  standalone: true,
  imports: [CommonModule, Navigation, ButtonComponent],
  templateUrl: './tournament-manage.html',
  styleUrls: ['./tournament-manage.scss'],
})
export class TournamentManage implements OnInit {

  ngOnInit() {
    
  }

  private id;

  constructor(
    private tournamentService:TournamentService,
    private activeRouter:ActivatedRoute,
    private notifService:SystemNotificationService,
    private partidaService:PartidaService,
    private router:Router
  ){
    this.id = this.activeRouter.snapshot.paramMap.get('id') || '';
    this.buscaTorneio()
    this.buscaPartidas()
  }

  private arrPartidasSubject:BehaviorSubject<any> = new BehaviorSubject<any>([])
  arrPartidas:Observable<any> = this.arrPartidasSubject.asObservable()

  private dadosTorneioSubject:BehaviorSubject<any> = new BehaviorSubject<any>([])
  dadosTorneio:Observable<any> = this.dadosTorneioSubject.asObservable();


  buscaTorneio(){
    this.tournamentService.getTorneioById(this.id).subscribe({
      next:(res)=>{
        console.log(res)
        this.dadosTorneioSubject.next(res)
      },
      error:(err)=>{
        console.log(err)
        this.notifService.notificar('erro','Erro ao buscar dados do torneio')
      }
    })
  }

  buscaPartidas() {
    this.tournamentService.getPartidasDoTorneio(this.id).subscribe({
      next: (res) => {
        console.log(res)
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
