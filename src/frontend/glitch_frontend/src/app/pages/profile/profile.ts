import { Component, OnDestroy, OnInit } from '@angular/core';
import { Navigation } from '../../components/navigation/navigation';
import { ButtonComponent } from '../../components/button/button';
import { Router } from '@angular/router';
import { Usuario, UsuarioService } from '../../services/usuario-service';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import { Equipe, EquipeService } from '../../services/equipe-service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import {
  PartidaJogadorResumo,
  TournamentService,
} from '../../services/tournament-service';

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

  private relatoriosSubject = new BehaviorSubject<PartidaJogadorResumoUI[]>([]);
  relatorios = this.relatoriosSubject.asObservable();

  constructor(
    private router: Router,
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
    this.carregarEquipes();
    this.buscarRelatorioPartidasJogador();

    this.sub = this.usuarioService.getDadosUpdate().subscribe({
      next: (res) => {
        this.dadosUsuario = this.validaResposta(res);
      },
    });
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
  }
}
