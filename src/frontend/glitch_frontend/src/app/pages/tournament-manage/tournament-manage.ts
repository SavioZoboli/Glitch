import { Component, OnInit } from '@angular/core';
import { Navigation } from '../../components/navigation/navigation';
import { ButtonComponent } from '../../components/button/button';
import { ThemeToggler } from '../../components/theme-toggler/theme-toggler';
import { AsyncPipe, CommonModule } from '@angular/common';
import { TournamentService } from '../../services/tournament-service';
import { ActivatedRoute,Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import { PartidaService } from '../../services/partida-service';



@Component({
  selector: 'app-tournament-manage',
  standalone: true,
  imports: [Navigation, ButtonComponent, AsyncPipe],
  templateUrl: './tournament-manage.html',
  styleUrls: ['./tournament-manage.scss'],
})
export class TournamentManage implements OnInit {

  private id: string;

  private dadosTorneioSubject: Subject<any> = new Subject<any>();
  dadosTorneio: Observable<any> = this.dadosTorneioSubject.asObservable();

  private arrPartidasSubject: Subject<any[]> = new Subject<any[]>();
  arrPartidas: Observable<any[]> = this.arrPartidasSubject.asObservable();



  constructor(
    private tournamentService: TournamentService,
    private route: ActivatedRoute,
    private notifService: SystemNotificationService,
    private router:Router,
    private partidaService:PartidaService
  ) {
    this.id = this.route.snapshot.paramMap.get('id') || '';
  }


  ngOnInit(): void {
    this.tournamentService.getTorneioById(this.id).subscribe({
      next: (res) => {
        console.log(res)
        this.dadosTorneioSubject.next(res)
      }
    })

    this.buscaPartidas();

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
