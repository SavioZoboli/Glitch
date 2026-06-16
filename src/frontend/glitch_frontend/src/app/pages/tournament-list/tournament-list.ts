import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject, Observable } from 'rxjs';
import { ButtonComponent } from '../../components/button/button';
import { InputComponent } from '../../components/input/input';
import { Modal } from '../../components/modal/modal';
import { PaginationControlsComponent } from '../../components/pagination-controls/pagination-controls';
import { Subscription } from '../../services/helpers/subscription';
import { JogoService } from '../../services/jogo-service';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import {
  FiltrosTorneioListagem,
  PaginacaoResposta,
  TournamentService,
} from '../../services/tournament-service';
import { UsuarioService } from '../../services/usuario-service';
import { DateRangePickerComponent } from '../../components/DateRangepicker/date-range-picker';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [
    ButtonComponent,
    CommonModule,
    AsyncPipe,
    Modal,
    PaginationControlsComponent,
    InputComponent,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatIconModule,
    DateRangePickerComponent,
  ],
  templateUrl: './tournament-list.html',
  styleUrls: ['./tournament-list.scss'],
})
export class TournamentList implements OnInit {
  private tournamentSubject: BehaviorSubject<any[]> = new BehaviorSubject<
    any[]
  >([]);
  tournaments$: Observable<any[]> = this.tournamentSubject.asObservable();

  currentUser: string = '';
  carregandoTorneios: boolean = false;
  paginacao: PaginacaoResposta = this.getPaginacaoInicial();
  jogos: any[] = [];

  filtroJogoControl = new FormControl('');
  filtroDataInicioControl = new FormControl<Date | null>(null);
  filtroDataFimControl = new FormControl<Date | null>(null);

  filtrosAtivos: FiltrosTorneioListagem = {};

  @ViewChild(DateRangePickerComponent)
  dateRangePicker!: DateRangePickerComponent;

  constructor(
    private router: Router,
    private tournamentService: TournamentService,
    private jogoService: JogoService,
    private subscriptionService: Subscription,
    private usuarioService: UsuarioService,
    private notifService: SystemNotificationService,
  ) {}

  ngOnInit() {
    const usuario = this.usuarioService.getUsuarioLogado();
    if (usuario) {
      this.currentUser = usuario.nickname;
    }

    this.buscarJogos();
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

  private buscarJogos(): void {
    this.jogoService.getJogos().subscribe({
      next: (res) => {
        this.jogos = res ?? [];
      },
      error: () => {
        this.notifService.notificar('erro', 'Erro ao carregar jogos');
      },
    });
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

    this.tournamentService
      .getTournamentsPaginated(pagina, this.filtrosAtivos)
      .subscribe({
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

  filtrarTorneios(): void {
    const jogoSelecionado = this.jogos.find(
      (j: any) => j.codigo === this.filtroJogoControl.value,
    );
    const dataInicio = this.filtroDataInicioControl.value;
    const dataFim = this.filtroDataFimControl.value;

    if (
      dataInicio &&
      dataFim &&
      new Date(dataInicio).getTime() > new Date(dataFim).getTime()
    ) {
      this.notifService.notificar(
        'aviso',
        'A data inicial nao pode ser maior que a data final.',
      );
      return;
    }

    this.filtrosAtivos = {};

    if (jogoSelecionado?.nome) {
      this.filtrosAtivos.jogo = jogoSelecionado.nome;
    }

    if (dataInicio && dataFim) {
      this.filtrosAtivos.data_inicio = this.formatarDataParaApi(dataInicio);
      this.filtrosAtivos.data_fim = this.formatarDataParaApi(dataFim);
    } else {
      const dataUnica = dataInicio || dataFim;
      if (dataUnica) {
        this.filtrosAtivos.data = this.formatarDataParaApi(dataUnica);
      }
    }

    this.buscarTorneios(1);
  }

  private formatarDataParaApi(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  limparFiltros(): void {
    this.filtroJogoControl.setValue('');
    this.dateRangePicker?.clear();
    this.filtrosAtivos = {};
    this.buscarTorneios(1);
  }

  gotCreateTournament() {
    this.router.navigate(['/tournaments/create-tournament']);
  }

  private obterModoInscricao(t: any): 'individual' | 'grupo' | null {
    const modo = String(
      t?.configuracao_inscricao?.modo_inscricao ?? t?.tipo_inscricao ?? '',
    )
      .trim()
      .toLowerCase();

    if (modo === 'individual') return 'individual';
    if (modo === 'grupo') return 'grupo';
    return null;
  }

  private obterLimiteParticipantes(t: any): number | null {
    const limite = Number(
      t?.configuracao_inscricao?.qtd_participantes_max ??
        t?.qtd_participantes_max,
    );

    if (!Number.isFinite(limite) || limite <= 0) return null;
    return limite;
  }

  canJoinTournament(t: any): boolean {
    if (!t || t.dt_fim) return false;
    if (t.responsavel?.organizador === this.currentUser) return false;
    if (t.aceita_ingresso === false) return false;
    if (t.isMembro) return false;

    const limite = this.obterLimiteParticipantes(t);
    const inscritos = Array.isArray(t.participantes) ? t.participantes.length : 0;
    if (limite !== null && inscritos >= limite) return false;

    return this.obterModoInscricao(t) !== null;
  }

  joinTournament(t: any) {
    const modo = this.obterModoInscricao(t);

    if (!modo) {
      this.notifService.notificar(
        'erro',
        'Não foi possível identificar o modo de inscrição do torneio.',
      );
      return;
    }

    this.subscriptionService.subscribe(t.codigo, modo);
  }

  editTournament(t: string) {
    this.router.navigate([`/update-tournament/${t}`]);
  }

  viewTournament(t: string) {
    this.router.navigate([`/tournaments/details/${t}`]);
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
