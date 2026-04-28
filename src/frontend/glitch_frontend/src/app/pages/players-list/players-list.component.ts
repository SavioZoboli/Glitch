import { Component, OnInit } from '@angular/core';
import { InputComponent } from '../../components/input/input';
import { ButtonComponent } from '../../components/button/button';
import { ThemeToggler } from '../../components/theme-toggler/theme-toggler';
import { FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../components/navigation/navigation';
import { Usuario, UsuarioService } from '../../services/usuario-service'; 
import { HttpClient } from '@angular/common/http';
import { Equipe, EquipeService, Membro } from '../../services/equipe-service';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import { catchError, EMPTY, forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-players-list',
  standalone: true,
  imports: [
    InputComponent,
    ButtonComponent,
    ThemeToggler,
    FormsModule,
    CommonModule,
    Navigation,
  ],
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.scss'],
})
export class PlayersListComponent implements OnInit {
  // A variável agora armazena o Observable, e não o array.
  jogadores$!: Observable<Usuario[]>;
  filtroControl: FormControl = new FormControl('');
  isInviteModalOpen = false;
  private id: string | null | undefined;
  selectedEquipeId: string | null = null;

  selectedInviteIds: Set<string> = new Set<string>();
  equipes$!: Observable<Equipe[]>;

  constructor(
    private usuarioService: UsuarioService,
    private httpClient: HttpClient,
    private equipeService: EquipeService,
    private sisNotifService: SystemNotificationService,
  ) {}

  ngOnInit(): void {
    this.buscarUsuarios();
    this.equipes$ = this.equipeService.minhasEquipes$;
    this.equipeService.carregarEquipes();
  }

  buscarUsuarios(): void {
    this.jogadores$ = this.usuarioService.getUsuarios().pipe(
      catchError((err) => {
        console.error('Erro ao buscar jogadores:', err);
        return EMPTY;
      }),
    );
  }

  openInviteModal() {
    this.isInviteModalOpen = true;
    //Aqui talvez tenhamos que colcoar pontos de limpeza de formulário depois.
    this.equipeService.carregarEquipes();
  }

  verificarEquipesParticipante(): Observable<any> {
    console.log(
      'Por enquanto buscamos todas as equipes pq só tem um usuário com equipe mesmo TESTE',
    );

    //   TODO: PRECISA EXISTIR UM ENDPOINT QUE TRAGA AS EQUIPES DO USUÁRIO LOGADO COM BASE NO ID DELE

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    this.openInviteModal();
    return this.httpClient.get('http://localhost:3000/api/equipe/equipes', {
      headers,
    });
  }

  //Seleção das pessoas
  toggleUserSelection(nickname: string) {
    if (this.selectedInviteIds.has(nickname)) {
      this.selectedInviteIds.delete(nickname);
      return;
    }
    this.selectedInviteIds.add(nickname);
  }

  isUserSelected(nickname: string): boolean {
    return this.selectedInviteIds.has(nickname);
  }

  //Envio de convites
  saveInvites() {
    const selectedIds = Array.from(this.selectedInviteIds);
    console.log('SAVE');

    if (!this.selectedEquipeId || selectedIds.length === 0) {
      this.isInviteModalOpen = false;
      return;
    }

    const requests = selectedIds.map((nickname) =>
      this.equipeService.convidarJogador(this.selectedEquipeId!, {
        nickname,
        is_titular: false,
        is_lider: false,
        funcao: 'jogador',
      }),
    );

    forkJoin(requests).subscribe({
      next: () => {
        selectedIds.forEach((nickname) => {
          this.sisNotifService.notificar(
            'sucesso',
            `Jogador ${nickname} convidado`,
          );
        });
        this.selectedInviteIds.clear();
        this.isInviteModalOpen = false;
      },
      error: () => {
        this.sisNotifService.notificar('erro', 'Erro ao convidar jogador(es)');
      },
    });
  }

  cancelInviteModal() {
    this.selectedInviteIds.clear();
    this.isInviteModalOpen = false;
  }

  selecionarEquipe(id: string) {
    this.selectedEquipeId = id;
    this.saveInvites();
    console.log('select');
  }

  abrirModalConvite(nickname: string) {
    this.selectedInviteIds.clear();
    this.selectedInviteIds.add(nickname);
    this.isInviteModalOpen = true;
    this.equipeService.carregarEquipes();
  }

}
