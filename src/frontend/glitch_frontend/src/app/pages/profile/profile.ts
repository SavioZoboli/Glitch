import { Component, OnDestroy, OnInit } from '@angular/core';
import { Navigation } from '../../components/navigation/navigation';
import { ButtonComponent } from '../../components/button/button';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuario, UsuarioService } from '../../services/usuario-service';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import { Equipe, EquipeService } from '../../services/equipe-service';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  forkJoin,
  of,
} from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import {
  PartidaJogadorResumo,
  TournamentService,
} from '../../services/tournament-service';
import { catchError } from 'rxjs/operators';

type PartidaJogadorResumoUI = Omit<PartidaJogadorResumo, 'data_partida'> & {
  data_partida: Date | null;
};
@Component({
  selector: 'app-profile',
  imports: [Navigation, ButtonComponent, MatIconModule, AsyncPipe],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  nickname: string = '';
  minhasEquipes: Observable<Equipe[]> | undefined;
  dadosUsuario?: Usuario;
  sub?: Subscription;
  subPerfilVisitado?: Subscription;
  isPerfilPublico = false;
  perfilJogadorId: string | null = null;

  private relatoriosSubject = new BehaviorSubject<PartidaJogadorResumoUI[]>([]);
  relatorios = this.relatoriosSubject.asObservable();
  private equipesPerfilVisitadoSubject = new BehaviorSubject<Equipe[]>([]);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private sysNotifService: SystemNotificationService,
    private equipeService: EquipeService,
    private torneioService: TournamentService,
  ) {
    let dados = localStorage.getItem('userData');
    if (dados) {
      this.nickname = JSON.parse(dados).nickname;
    }
    this.minhasEquipes = this.equipeService.minhasEquipes$;
  }

  private validaResposta(res: any): Usuario {
    let dados: Usuario = {
      id: res.id,
      nickname: res.nickname,
      aboutMe: res.aboutMe ?? res.sobre_mim ?? null,
      avatarUrl: res.avatarUrl ?? res.avatar_url ?? null,
      dt_criacao: new Date(res.dt_criacao),
      ultima_altera_senha: res.ultima_altera_senha
        ? new Date(res.ultima_altera_senha)
        : null,
      pessoa: {
        id: res.pessoa.id,
        nome: res.pessoa.nome,
        sobrenome: res.pessoa.sobrenome,
        dt_nascimento: new Date(`${res.pessoa.dt_nascimento}T00:00:00.000Z`),
        cpf: this.mascaraCPF(res.pessoa.cpf),
        email: res.pessoa.email,
        telefone: res.pessoa.telefone,
        is_ativo: res.pessoa.is_ativo,
        nacionalidade: res.pessoa.nacionalidade,
      },
    };
    return dados;
  }

  private mascaraCPF(cpf: string): string {
    return cpf.substring(8, 11).padStart(11, '#');
  }

  //Formtação de telefone
  formatarTelefone(telefone: string | undefined): string {
    if (!telefone) return '';

    const numeros = telefone.replace(/\D/g, '');

    if (numeros.length === 11) {
      return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    if (numeros.length === 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    return telefone;
  }

  ngOnInit() {
    const jogadorId = String(this.route.snapshot.paramMap.get('id') ?? '').trim();
    if (jogadorId) {
      this.isPerfilPublico = true;
      this.perfilJogadorId = jogadorId;
      this.carregarPerfilVisitado(jogadorId);
      return;
    }

    this.carregarEquipes();
    this.buscarRelatorioPartidasJogador();

    this.sub = this.usuarioService.getDadosUpdate().subscribe({
      next: (res) => {
        this.dadosUsuario = this.validaResposta(res);
        this.nickname = this.dadosUsuario.nickname;
      },
    });
  }

  obterAvatarUsuario(): string {
    return this.usuarioService.obterAvatarComFallback(
      this.dadosUsuario?.avatarUrl ?? null,
    );
  }

  editProfile() {
    this.router.navigate([`/update-account`]);
  }

  deleteProfile() {
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.',
    );

    if (confirmar) {
      this.usuarioService.deleteUsuario().subscribe({
        next: () => {
          this.sysNotifService.notificar(
            'sucesso',
            'Removido com sucesso, deslogando...',
          );
          localStorage.removeItem('token');
          this.router.navigate(['/']);
        },
        error: (erro: any) => {
          console.error('Erro ao excluir usuário:', erro);
          this.sysNotifService.notificar(
            'erro',
            'Não foi possível excluir a conta',
          );
        },
      });
    }
  }

  carregarEquipes(): void {
    this.equipeService.carregarEquipes();
  }

  private carregarPerfilVisitado(jogadorId: string): void {
    this.minhasEquipes = this.equipesPerfilVisitadoSubject.asObservable();
    this.equipesPerfilVisitadoSubject.next([]);
    this.relatoriosSubject.next([]);

    this.sub = this.usuarioService.getUsuarios().subscribe({
      next: (usuarios: any[]) => {
        const jogador = (usuarios ?? []).find(
          (usuario) => String(usuario?.id ?? '').trim() === jogadorId,
        );

        if (!jogador) {
          this.sysNotifService.notificar('erro', 'Jogador não encontrado.');
          this.router.navigate(['/players']);
          return;
        }

        this.dadosUsuario = this.mapearJogadorParaPerfil(jogador);
        this.nickname = this.dadosUsuario.nickname;
        this.carregarDadosPerfilVisitado(jogadorId, this.nickname);
      },
      error: () => {
        this.sysNotifService.notificar(
          'erro',
          'Não foi possível carregar o perfil do jogador.',
        );
        this.router.navigate(['/players']);
      },
    });
  }

  private mapearJogadorParaPerfil(jogador: any): Usuario {
    const dataCriacao = jogador?.dt_criacao
      ? new Date(jogador.dt_criacao)
      : new Date();
    const dataNascimento = jogador?.pessoa?.dt_nascimento
      ? new Date(jogador.pessoa.dt_nascimento)
      : new Date('1900-01-01T00:00:00.000Z');

    return {
      id: String(jogador?.id ?? ''),
      nickname: String(jogador?.nickname ?? ''),
      aboutMe: jogador?.aboutMe ?? jogador?.sobre_mim ?? null,
      avatarUrl: jogador?.avatarUrl ?? jogador?.avatar_url ?? null,
      dt_criacao: dataCriacao,
      ultima_altera_senha: null,
      pessoa: {
        id: String(jogador?.pessoa?.id ?? ''),
        nome: String(jogador?.pessoa?.nome ?? ''),
        sobrenome: String(jogador?.pessoa?.sobrenome ?? ''),
        dt_nascimento: dataNascimento,
        cpf: String(jogador?.pessoa?.cpf ?? ''),
        email: String(jogador?.pessoa?.email ?? ''),
        telefone: String(jogador?.pessoa?.telefone ?? ''),
        is_ativo: Boolean(jogador?.pessoa?.is_ativo ?? true),
        nacionalidade: String(jogador?.pessoa?.nacionalidade ?? ''),
      },
    };
  }

  private carregarDadosPerfilVisitado(
    jogadorId: string,
    nicknameJogador: string,
  ): void {
    const nicknameNormalizado = String(nicknameJogador ?? '').trim().toLowerCase();
    const jogadorIdNormalizado = String(jogadorId ?? '').trim();

    this.subPerfilVisitado = forkJoin({
      equipes: this.equipeService.getEquipes().pipe(
        catchError(() => {
          return of([]);
        }),
      ),
      partidas: this.torneioService.getPartidasDoJogadorPorId(jogadorId).pipe(
        catchError(() => {
          return of([]);
        }),
      ),
    }).subscribe({
      next: ({ equipes, partidas }) => {
        const listaEquipes = Array.isArray(equipes) ? equipes : [];
        const equipesDoJogador = listaEquipes.filter((equipe: any) =>
          Array.isArray(equipe?.membros) &&
          equipe.membros.some((membro: any) => {
            const nickMembro = String(membro?.nickname ?? '')
              .trim()
              .toLowerCase();
            const membroUsuarioId = String(
              membro?.usuario_id ?? membro?.id ?? '',
            ).trim();

            const possuiCampoAceite = Object.prototype.hasOwnProperty.call(
              membro ?? {},
              'dt_aceito',
            );
            const membroAceito = !possuiCampoAceite || membro?.dt_aceito !== null;

            const mesmoJogador =
              nickMembro === nicknameNormalizado ||
              (membroUsuarioId.length > 0 &&
                membroUsuarioId === jogadorIdNormalizado);

            return mesmoJogador && membroAceito;
          }),
        );

        this.equipesPerfilVisitadoSubject.next(equipesDoJogador);

        this.relatoriosSubject.next(
          (partidas ?? []).map((item) => ({
            ...item,
            data_partida: item.data_partida ? new Date(item.data_partida) : null,
          })),
        );
      },
      error: () => {
        this.equipesPerfilVisitadoSubject.next([]);
        this.relatoriosSubject.next([]);
      },
    });
  }

  buscarRelatorioPartidasJogador() {
    this.torneioService.getPartidasDoJogador().subscribe({
      next: (res) => {
        this.relatoriosSubject.next(
          res.map((item) => ({
            ...item,
            data_partida: item.data_partida
              ? new Date(item.data_partida)
              : null,
          })),
        );
      },
      error: (err) => console.log(err),
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.subPerfilVisitado?.unsubscribe();
  }
}
