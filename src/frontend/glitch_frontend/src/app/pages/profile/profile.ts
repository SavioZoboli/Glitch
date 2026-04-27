import { Component, OnInit } from '@angular/core';
import { Navigation } from '../../components/navigation/navigation';
import { ButtonComponent } from '../../components/button/button';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario-service';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import { Equipe, EquipeService } from '../../services/equipe-service';
import { BehaviorSubject, Observable } from 'rxjs';
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
export class ProfileComponent {
  nickname: string = '';
  minhasEquipes: Observable<Equipe[]> | undefined;

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

  ngOnInit() {
    this.carregarEquipes();
    this.buscarRelatorioPartidasJogador();
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
}
