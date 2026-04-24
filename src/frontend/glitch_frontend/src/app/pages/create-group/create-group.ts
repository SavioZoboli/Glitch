import { Component, OnInit } from '@angular/core';
import { Navigation } from '../../components/navigation/navigation';
import { InputComponent } from '../../components/input/input';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonComponent } from '../../components/button/button';
import { EquipeService } from '../../services/equipe-service';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import {
  Usuario,
  UsuarioResumo,
  UsuarioService,
} from '../../services/usuario-service';
import { catchError, EMPTY, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ToggleButtonComponent } from '../../components/toggle-button/toggle.button';

@Component({
  selector: 'app-create-group',
  imports: [
    Navigation,
    InputComponent,
    ButtonComponent,
    AsyncPipe,
    ReactiveFormsModule,
  ],
  templateUrl: './create-group.html',
  styleUrl: './create-group.scss',
})
export class CreateGroup implements OnInit {
  jogadores$!: Observable<UsuarioResumo[]>;

  convidados: string[] = [];

  form: FormGroup = new FormGroup({
    nome: new FormControl('', Validators.required),
  });

  get nomeControl(): FormControl {
    return this.form.get('nome') as FormControl;
  }

  constructor(
    private equipeService: EquipeService,
    private notifService: SystemNotificationService,
    private usuarioService: UsuarioService,
    private router: Router,
  ) {}

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.form.valid) {
      let nome = this.nomeControl.value;
      this.equipeService.addEquipe(nome).subscribe({
        next: (res) => {
          console.log(res);
          this.notifService.notificar('sucesso', 'Equipe criada com sucesso');
          if (this.convidados.length > 0 && res.equipe) {
            this.notifService.notificar('info', 'Convidando jogadores...');
            let invites = this.convidados;
            invites.forEach((n: string) => {
              this.convidarJogador(res.equipe, {
                nickname: n,
                is_titular: false,
                is_lider: false,
                funcao: 'jogador',
              });
            });
          }

          this.router.navigate(['/groups']);
        },
        error: (err) => {
          console.log(err);
          this.notifService.notificar('erro', 'Erro ao criar equipe');
        },
      });
    }
  }

  private convidarJogador(
    equipe: string,
    jogador: {
      nickname: string;
      is_titular: boolean;
      is_lider: boolean;
      funcao: string;
    },
  ) {
    this.equipeService.convidarJogador(equipe, jogador).subscribe({
      next: (res) => {
        this.notifService.notificar('sucesso', `Jogador ${jogador} convidado`);
      },
      error: (err) => {
        console.log(err);
        this.notifService.notificar('erro', `Erro ao convidar ${jogador}`);
      },
    });
  }

  toggleConvidado(nickname: string) {
    let index = this.convidados.indexOf(nickname);
    if (index != -1) {
      this.convidados.splice(index, 1);
    } else {
      this.convidados.push(nickname);
    }
    console.log('Selecionados:', this.convidados);
  }

  isSelecionado(nickname: string): boolean {
    return this.convidados.includes(nickname);
  }

  clearForm() {
    this.nomeControl.reset();
    this.convidados.forEach((c) => {
      let input = document.getElementById('checkbox' + c) as HTMLInputElement;
      if (input) {
        input.checked = false;
      }
    });
    this.convidados = [];
  }

  ngOnInit(): void {
    this.jogadores$ = this.usuarioService.getUsuariosResumido().pipe(
      catchError((err) => {
        // Se ocorrer um erro na API, podemos logar e retornar um array vazio.
        // Isso evita que a tela quebre se a chamada falhar.
        console.error('Erro ao buscar jogadores:', err);
        return EMPTY; // ou return of([]); se preferir emitir um array vazio.
      }),
    );
  }

  return() {
    this.router.navigate(['/groups']);
  }

  isMobile(): boolean {
    return window.innerWidth <= 768;
  }
}
