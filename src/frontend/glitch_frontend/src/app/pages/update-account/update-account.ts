import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Navigation } from '../../components/navigation/navigation';
import { InputComponent } from '../../components/input/input';
import { ButtonComponent } from '../../components/button/button';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario, UsuarioService } from '../../services/usuario-service';
import { Subscription } from 'rxjs';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-update-account',
  imports: [
    Navigation,
    InputComponent,
    ButtonComponent,
    ReactiveFormsModule,
    MatIconModule,
  ],
  templateUrl: './update-account.html',
  styleUrl: './update-account.scss',
})
export class UpdateAccount implements OnInit, OnDestroy {
  @ViewChild('avatarInput')
  avatarInput?: ElementRef<HTMLInputElement>;

  getDadosSubscription: Subscription | undefined;
  updateSubscription: Subscription | undefined;
  uploadAvatarSubscription: Subscription | undefined;

  dadosUsuario: Usuario | undefined;
  avatarArquivoSelecionado: File | null = null;
  avatarPreviewUrl: string = '';

  private readonly tiposAvatarPermitidos = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
  ]);
  private readonly tamanhoMaximoAvatar = 2 * 1024 * 1024;

  constructor(
    private usuarioService: UsuarioService,
    private sysNotifService: SystemNotificationService,
    private router: Router,
  ) {
    this.avatarPreviewUrl = this.usuarioService.avatarPadraoUrl;
  }

  ngOnInit(): void {
    this.getDadosSubscription = this.usuarioService.getDadosUpdate().subscribe({
      next: (res) => {
        if (res) {
          console.log(res);
          if (!res.id && !res.pessoa.id) {
            this.sysNotifService.notificar(
              'erro',
              'Não foi possível buscar os dados',
            );
            console.log(res);
          } else {
            this.dadosUsuario = this.validaResposta(res);
            this.initFormulario();
          }
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
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

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/), // (99) 99999-9999 ou 9999-9999
    ]),
    nickname: new FormControl('', []),
    nacionalidade: new FormControl('', [Validators.required]),
    aboutMe: new FormControl('', [Validators.maxLength(500)]),
  });

  //Getters para usar no template
  get emailControl() {
    return this.form.get('email') as FormControl;
  }
  get phoneControl() {
    return this.form.get('phone') as FormControl;
  }
  get nicknameControl() {
    return this.form.get('nickname') as FormControl;
  }
  get nacionalidadeControl() {
    return this.form.get('nacionalidade') as FormControl;
  }
  get aboutMeControl() {
    return this.form.get('aboutMe') as FormControl;
  }
  // Método de submit
  submit() {
    if (this.form.valid) {
      let dadosUpdate = {
        id: this.dadosUsuario?.id,
        email: this.emailControl.value,
        telefone: this.phoneControl.value,
        nickname: this.nicknameControl.value,
        nacionalidade: this.nacionalidadeControl.value,
        aboutMe: this.aboutMeControl.value,
      };
      this.updateSubscription = this.usuarioService
        .updateUsuario(dadosUpdate)
        .subscribe({
          next: () => {
            if (!this.avatarArquivoSelecionado) {
              this.finalizarAtualizacaoPerfil();
              return;
            }

            this.uploadAvatarSubscription = this.usuarioService
              .uploadAvatar(this.avatarArquivoSelecionado)
              .subscribe({
                next: () => {
                  this.sysNotifService.notificar(
                    'sucesso',
                    'Foto de perfil atualizada.',
                  );
                  this.finalizarAtualizacaoPerfil();
                },
                error: () => {
                  this.sysNotifService.notificar(
                    'aviso',
                    'Dados atualizados, mas não foi possível salvar a foto agora.',
                  );
                  this.finalizarAtualizacaoPerfil();
                },
              });
          },
          error: (error) => {
            console.log(error);
            this.sysNotifService.notificar('erro', 'Erro ao salvar');
          },
        });
    } else {
      console.log('Formulário inválido');
      this.form.markAllAsTouched();
    }
  }

  private finalizarAtualizacaoPerfil(): void {
    this.usuarioService.getMeusDados().subscribe({
      next: (dadosUsuario) => {
        this.usuarioService.atualizarUsuarioLocal(dadosUsuario, true);
        this.sysNotifService.notificar('sucesso', 'Atualizado com sucesso!');
        this.router.navigate(['/profile']);
      },
      error: () => {
        this.sysNotifService.notificar('sucesso', 'Atualizado com sucesso!');
        this.router.navigate(['/profile']);
      },
    });
  }

  abrirSeletorAvatar(): void {
    this.avatarInput?.nativeElement.click();
  }

  onAvatarSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];

    if (!arquivo) return;

    if (!this.tiposAvatarPermitidos.has(arquivo.type)) {
      this.sysNotifService.notificar(
        'erro',
        'Formato inválido. Use JPG, PNG ou WEBP.',
      );
      input.value = '';
      return;
    }

    if (arquivo.size > this.tamanhoMaximoAvatar) {
      this.sysNotifService.notificar(
        'erro',
        'A imagem deve ter no máximo 2MB.',
      );
      input.value = '';
      return;
    }

    if (this.avatarPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.avatarPreviewUrl);
    }

    this.avatarArquivoSelecionado = arquivo;
    this.avatarPreviewUrl = URL.createObjectURL(arquivo);
  }

  initFormulario() {
    this.form.reset();
    if (!this.dadosUsuario || !this.dadosUsuario.pessoa) {
      return;
    }
    this.emailControl.setValue(this.dadosUsuario.pessoa.email);
    this.phoneControl.setValue(this.dadosUsuario.pessoa.telefone);
    this.nicknameControl.setValue(this.dadosUsuario.nickname);
    this.nacionalidadeControl.setValue(this.dadosUsuario.pessoa.nacionalidade);
    this.aboutMeControl.setValue(this.dadosUsuario.aboutMe ?? '');
    this.avatarPreviewUrl = this.usuarioService.obterAvatarComFallback(
      this.dadosUsuario.avatarUrl ?? null,
    );
  }

  ngOnDestroy(): void {
    if (this.getDadosSubscription) {
      this.getDadosSubscription.unsubscribe();
    }
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
    if (this.uploadAvatarSubscription) {
      this.uploadAvatarSubscription.unsubscribe();
    }
    if (this.avatarPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.avatarPreviewUrl);
    }
  }

  normalizeEmail(event: any) {
    const value = event.target.value.replace(/[^a-zA-Z0-9@._-]/g, '');
    event.target.value = value.toLowerCase();
    this.emailControl.setValue(value.toLowerCase());
  }

  cancel() {
    this.form.reset();
    this.router.navigate(['/profile']);
  }
}

