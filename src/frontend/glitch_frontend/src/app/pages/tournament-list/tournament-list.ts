import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ButtonComponent } from '../../components/button/button';
import { Modal } from '../../components/modal/modal';
import { PaginationControlsComponent } from '../../components/pagination-controls/pagination-controls';
import { Subscription } from '../../services/helpers/subscription';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import {
  PaginacaoResposta,
  TournamentService,
} from '../../services/tournament-service';
import { UsuarioService } from '../../services/usuario-service';

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [
    ButtonComponent,
    CommonModule,
    AsyncPipe,
    Modal,
    PaginationControlsComponent,
  ],
  templateUrl: './tournament-list.html',
  styleUrls: ['./tournament-list.scss'],
})
export class TournamentList implements OnInit {
  private tournamentSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(
    [],
  );
  tournaments$: Observable<any[]> = this.tournamentSubject.asObservable();

  currentUser: string = '';
  carregandoTorneios: boolean = false;
  paginacao: PaginacaoResposta = this.getPaginacaoInicial();

  constructor(
    private router: Router,
    private tournamentService: TournamentService,
    private subscriptionService: Subscription,
    private usuarioService: UsuarioService,
    private notifService: SystemNotificationService,
  ) {}

  ngOnInit() {
    const usuario = this.usuarioService.getUsuarioLogado();
    if (usuario) {
      this.currentUser = usuario.nickname;
    }

    this.buscarTorneios(1);
  }

  private getPaginacaoInicial(): PaginacaoResposta {
    return {
      pagina_atual: 1,
      itens_por_pagina: 10,
      total_itens: 0,
      total_paginas: 0,
      tem_proxima_pagina: false,
      tem_pagina_anterior: false,
    };
  }

  private marcarParticipacao(torneios: any[]): any[] {
    return torneios.map((t: any) => ({
      ...t,
      isMembro: (t.participantes ?? []).some((p: any) => {
        const isIndividual = p.usuario?.nickname === this.currentUser;
        const isNoGrupo = (p.equipe?.membros ?? []).some(
          (membro: any) => membro.nickname === this.currentUser,
        );

        return isIndividual || isNoGrupo;
      }),
    }));
  }

  public buscarTorneios(pagina: number): void {
    this.carregandoTorneios = true;

    this.tournamentService.getTournamentsPaginated(pagina).subscribe({
      next: (res) => {
        const torneios = this.marcarParticipacao(res.dados ?? []);
        this.tournamentSubject.next(torneios);
        this.paginacao = res.paginacao ?? this.getPaginacaoInicial();
      },
      error: (err) => {
        console.log(err);
        this.notifService.notificar('erro', 'Erro ao carregar torneios');
        this.tournamentSubject.next([]);
        this.paginacao = this.getPaginacaoInicial();
      },
      complete: () => {
        this.carregandoTorneios = false;
      },
    });
  }


  gotCreateTournament() {
    this.router.navigate(['/tournaments/create-tournament']);
  }

  joinTournament(t: any) {
    this.subscriptionService.subscribe(
      t.codigo,
      t.configuracao_inscricao.modo_inscricao.toLowerCase(),
    );
  }

  editTournament(t: string) {
    this.router.navigate([`/update-tournament/${t}`]);
  }

  deleteTournament(t: any) {
    if (!confirm('Deseja realmente remover esse torneio?')) {
      return;
    }

    this.tournamentService.removeTorneio(t).subscribe({
      next: () => {
        this.notifService.notificar('sucesso', 'Torneio removido');
        this.buscarTorneios(this.paginacao.pagina_atual);
      },
      error: (err) => {
        console.log(err);
        this.notifService.notificar('erro', 'Erro ao remover');
      },
    });
  }

  beginTournament(t: string) {
    this.router.navigate([`/tournaments/manage/${t}`]);
  }
}
