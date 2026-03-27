import { Component, OnInit } from '@angular/core';
import { Navigation } from '../../components/navigation/navigation';
import { InputComponent } from '../../components/input/input';
import {
  AbstractControl,
  FormArray,
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
import { BehaviorSubject, catchError, EMPTY, Observable } from 'rxjs';
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
    ToggleButtonComponent,
  ],
  templateUrl: './create-group.html',
  styleUrl: './create-group.scss',
})
export class CreateGroup implements OnInit {
  jogadores$: BehaviorSubject<UsuarioResumo[]> = new BehaviorSubject<
    UsuarioResumo[]
  >([]);
  jogadoresFiltrado$: BehaviorSubject<UsuarioResumo[]> = new BehaviorSubject<
    UsuarioResumo[]
  >([]);
  filtroControl: FormControl = new FormControl('');

  convidados: string[] = [];

  form: FormGroup = new FormGroup({
    nome: new FormControl('', Validators.required),
    membros: new FormArray([]),
  });

  get nomeControl(): FormControl {
    return this.form.get('nome') as FormControl;
  }
  get membrosControls(): FormArray {
    return this.form.get('membros') as FormArray;
  }

  constructor(
    private equipeService: EquipeService,
    private notifService: SystemNotificationService,
    private usuarioService: UsuarioService,
    private router: Router,
  ) {
    this.filtroControl.valueChanges.subscribe((val) => {
      this.filtraJogadores(val);
    });
  }

  filtraJogadores(filtro: string | null = null) {
    let jogadores = this.jogadores$.getValue();
    if (filtro) {
      let filtrado = jogadores.filter((j) =>
        j.nickname.toLowerCase().includes(filtro.toLowerCase()),
      );
      this.jogadoresFiltrado$.next(filtrado);
      return;
    }
    this.jogadoresFiltrado$.next(jogadores);
  }

  submit() {
    if (this.form.valid) {
      let nome = this.nomeControl.value;
      this.equipeService.addEquipe(nome).subscribe({
        next: (res) => {
          console.log(res);
          this.notifService.notificar('sucesso', 'Equipe criada com sucesso');
          if (this.membrosControls.length>0) {
            this.notifService.notificar('info', 'Convidando jogadores...');
            let invites = this.membrosControls.value;
            invites.forEach((n:{nickname:string,is_titular:boolean,is_lider:boolean,funcao:string}) => {
              this.convidarJogador(res.equipe, n);
            });
            this.router.navigate(['/groups']);
          }
        },
        error: (err) => {
          console.log(err);
          this.notifService.notificar('erro', 'Erro ao criar equipe');
        },
      });
    }
  }

  private convidarJogador(equipe: string, jogador: {nickname:string,is_titular:boolean,is_lider:boolean,funcao:string}) {
    this.equipeService.convidarJogador(equipe, jogador).subscribe({
      next: (res) => {
        this.notifService.notificar('sucesso', `Jogador ${jogador.nickname} convidado`);
      },
      error: (err) => {
        console.log(err);
        this.notifService.notificar('erro', `Erro ao convidar ${jogador}`);
      },
    });
  }

  pushConvidado(nickname: string) {
    let novo_membro = new FormGroup({
      nickname: new FormControl(nickname),
      is_titular: new FormControl(false),
      is_lider: new FormControl(false),
      funcao: new FormControl(''),
    });

    this.membrosControls.push(novo_membro);

    console.log(this.membrosControls);
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
    this.usuarioService.getUsuariosResumido().subscribe({
      next: (res) => {
        this.jogadores$.next(res);
        this.filtraJogadores();
      },
    });
  }

  return() {
    this.router.navigate(['/groups']);
  }

  public getMembroControl(index: number, controlName: string): FormControl {
    // Pega o FormGroup no índice (ex: o membro na linha 0)
    const formGroup = this.membrosControls.at(index) as FormGroup;

    // Pega o FormControl específico (ex: 'is_lider') dentro daquele grupo
    return formGroup.get(controlName) as FormControl;
  }

  removeIntegrante(index: number) {}
}
