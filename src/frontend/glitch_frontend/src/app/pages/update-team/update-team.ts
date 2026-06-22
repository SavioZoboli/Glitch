import { Component, OnInit } from '@angular/core';
import { InputComponent } from '../../components/input/input';
import { ButtonComponent } from '../../components/button/button';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ɵInternalFormsSharedModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Equipe, EquipeService, Membro } from '../../services/equipe-service';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  combineLatest,
  forkJoin,
  map,
  startWith,
} from 'rxjs';

import { Usuario, UsuarioResumo, UsuarioService } from '../../services/usuario-service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ToggleButtonComponent } from '../../components/toggle-button/toggle.button';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import { ChangeDetectorRef } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-update-team',
  standalone: true,
  imports: [
    InputComponent,
    ButtonComponent,
    ReactiveFormsModule,
    ToggleButtonComponent,
    ɵInternalFormsSharedModule,
    AsyncPipe,
    CommonModule,
  ],
  templateUrl: './update-team.html',
  styleUrl: './update-team.scss',
})
export class UpdateTeam implements OnInit {
  form: FormGroup;
  jogadores$!: Observable<Usuario[]>;
  private readonly avatarPorNickname = new Map<string, string | null>();

  get membrosControls(): FormArray {
    return this.form.get('membros') as FormArray;
  }
  get nomeControl(): FormControl {
    return this.form.get('nome') as FormControl;
  }
  filtroControl: FormControl = new FormControl();

  public getMembroControl(index: number, controlName: string): FormControl {
    const formGroup = this.membrosControls.at(index) as FormGroup;
    return formGroup.get(controlName) as FormControl;
  }

  private id: string | null;

  souLider: boolean = false;

  private equipeOriginal!: Equipe;

  private subjectListaUsuarios = new BehaviorSubject<UsuarioResumo[]>([]);
  listaUsuarios: Observable<UsuarioResumo[]> =
    this.subjectListaUsuarios.asObservable();
  listaUsuariosFiltrada: Observable<UsuarioResumo[]>;

  filtroUsuariosControl = new FormControl('');

  isInviteModalOpen = false;
  selectedInviteIds: Set<any> = new Set<any>();
  isLoadingUsuarios = false;

  constructor(
    private route: ActivatedRoute,
    private equipeService: EquipeService,
    private usuarioService: UsuarioService,
    private fb: FormBuilder,
    private sisNotifService: SystemNotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.id = this.route.snapshot.paramMap.get('id');

    this.form = new FormGroup({
      nome: this.fb.control('', Validators.required),
      membros: this.fb.array([]),
    });

    this.listaUsuariosFiltrada = combineLatest([
      this.listaUsuarios,
      this.filtroUsuariosControl.valueChanges.pipe(startWith('')),
    ]).pipe(
      map(([usuarios, filtro]) => {
        const termo = (filtro || '').toString().trim().toLowerCase();
        if (!termo) {
          return usuarios;
        }
        return usuarios.filter((usuario) =>
          usuario.nickname.toLowerCase().includes(termo),
        );
      }),
    );
  }

  ngOnInit(): void {
    this.buscarDadosEquipe();

    this.jogadores$ = this.filtroControl.valueChanges.pipe(
      startWith(''),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((value) => this.usuarioService.getUsuarios(value)),
      catchError(() => EMPTY),
    );

    // busca inicial (sem filtro)
    this.filtroControl.setValue('');
  }

  buscarDadosEquipe() {
    this.equipeService.getEquipePorId(this.id).subscribe({
      next: (res: Equipe) => {
        console.log(res);
        this.carregaDados(res);
      },
    });
  }

  carregaDados(equipe: Equipe) {
    this.registrarAvataresDeMembros(equipe?.membros ?? []);

    const membros = this.formatMembros(equipe.membros);
    if (membros.length == 0) {
      this.remove(true);
      return;
    }

    equipe.membros = membros;
    this.buscarResumoUsuarios();
    this.equipeOriginal = equipe;
    this.nomeControl.setValue(equipe.nome);
    this.souLider = this.isUsuarioLogadoLiderDaEquipe(membros);
    if (this.souLider) {
      this.nomeControl.enable();
    } else {
      this.nomeControl.disable();
    }

    this.geraControls(membros);
  }

  private isUsuarioLogadoLiderDaEquipe(membros: Membro[]): boolean {
    const dados = localStorage.getItem('userData');
    if (!dados) return false;

    const userData = JSON.parse(dados);
    const meuNickname = userData?.nickname;

    if (!meuNickname) return false;

    return membros.some((m) => m.nickname === meuNickname && m.is_lider);
  }

  private formatMembros(membros: any) {
    let membrosFormatado: Membro[] = [];
    membros.forEach((m: any) => {
      membrosFormatado.push({
        nickname: m.nickname,
        is_lider: m.is_lider,
        is_titular: m.is_titular,
        funcao: m.funcao,
        dt_aceito: m.dt_aceito,
        tipo: m.tipo,
      });
    });
    return membrosFormatado;
  }

  private geraControls(membros: Membro[]) {
    let formArray = this.membrosControls;
    let index = formArray.length - 1;
    while (formArray.length != 0) {
      formArray.removeAt(index);
      index--;
    }

    membros.forEach((m) => {
      this.addMembro(m);
    });
  }

  private addMembro(membro: Membro) {
    const formGroup = new FormGroup({
      nickname: new FormControl(membro.nickname),
      is_lider: new FormControl(membro.is_lider),
      is_titular: new FormControl(membro.is_titular),
      funcao: new FormControl(membro.funcao),
      dt_aceito: new FormControl(membro.dt_aceito || null),
    });

    const liderControl = formGroup.get('is_lider') as FormControl;
    liderControl.valueChanges.subscribe((isLiderSelecionado) => {
      if (!this.souLider || !isLiderSelecionado) return;

      this.membrosControls.controls.forEach((control) => {
        if (control === formGroup) return;

        const outroLiderControl = control.get('is_lider') as FormControl;
        if (outroLiderControl.value) {
          outroLiderControl.setValue(false, { emitEvent: false });
        }
      });
    });

    this.membrosControls.push(formGroup);
  }

  private calcularIdade(data: string | undefined): number {
    if (!data) return 0;

    const nascimento = new Date(data);
    const hoje = new Date();

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();

    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  }

  submit() {
    if (!this.souLider) {
      this.sisNotifService.notificar(
        'erro',
        'Somente o lider da equipe pode alterar os dados dos membros.',
      );
      return;
    }

    const novosDados = this.form.getRawValue();
    const { atualizados, deletados } = this.identificarAlteracoes();
    const nomeMudou = novosDados.nome !== this.equipeOriginal.nome;

    if (!nomeMudou && atualizados.length === 0 && deletados.length === 0) {
      this.sisNotifService.notificar('info', 'Nenhuma alteracao foi feita');
      return;
    }

    const existeLiderNoFormulario = (this.membrosControls.value as Membro[]).some(
      (membro) => membro.is_lider,
    );
    if (!existeLiderNoFormulario) {
      this.sisNotifService.notificar(
        'erro',
        'A equipe precisa ter pelo menos um lider ativo.',
      );
      return;
    }

    if (!this.id) {
      this.sisNotifService.notificar('erro', 'ID da equipe nao encontrado');
      return;
    }

    const requests: Observable<any>[] = [];

    if (nomeMudou) {
      requests.push(this.equipeService.updateEquipe(this.equipeOriginal.id, novosDados.nome));
    }

    atualizados.forEach((membroAtualizado) => {
      requests.push(this.equipeService.updateMembro(membroAtualizado, this.id!));
    });

    deletados.forEach((membroDeletado) => {
      requests.push(this.equipeService.deleteMembro(membroDeletado.nickname, this.id!));
    });

    forkJoin(requests).subscribe({
      next: () => {
        this.sisNotifService.notificar(
          'sucesso',
          'Alteracoes processadas com sucesso!',
        );
        this.equipeService.carregarEquipes();
        this.router.navigate(['/groups']);
      },
      error: (erro) => {
        const mensagem = this.extrairMensagemErro(
          erro,
          'Nao foi possivel salvar as alteracoes da equipe.',
        );
        this.sisNotifService.notificar('erro', mensagem);
      },
    });
  }

  private extrairMensagemErro(erro: any, fallback: string): string {
    if (erro?.status === 403) {
      return erro?.error?.message || 'Apenas o lider pode editar membros da equipe.';
    }

    return erro?.error?.message || fallback;
  }

  private identificarAlteracoes(): {
    atualizados: Membro[];
    deletados: Membro[];
  } {
    // 1. Pega o estado original (formatado)
    // Usamos a nova variável e a formatamos para ter a mesma estrutura do FormArray
    const membrosOriginais: Membro[] = this.equipeOriginal.membros;

    // 2. Pega o estado atual (o que o usuário vê no formulário)
    const membrosAtuais: Membro[] = this.membrosControls.value;

    const membrosAtualizados: Membro[] = [];
    const membrosDeletados: Membro[] = [];

    // 3. Loop 1: Checar por MODIFICAÇÕES
    for (const membroAtual of membrosAtuais) {
      const membroOriginal = membrosOriginais.find(
        (m) => m.nickname === membroAtual.nickname,
      );

      if (membroOriginal) {
        // O membro existe nas duas listas. Vamos ver se algo mudou.
        const mudou =
          membroOriginal.is_lider !== membroAtual.is_lider ||
          membroOriginal.is_titular !== membroAtual.is_titular ||
          membroOriginal.funcao !== membroAtual.funcao;

        if (mudou) {
          membrosAtualizados.push(membroAtual);
        }
      }
    }

    // 4. Loop 2: Checar por DELEÇÕES
    for (const membroOriginal of membrosOriginais) {
      const aindaExiste = membrosAtuais.find(
        (m) => m.nickname === membroOriginal.nickname,
      );

      if (!aindaExiste) {
        membrosDeletados.push(membroOriginal);
      }
    }

    return { atualizados: membrosAtualizados, deletados: membrosDeletados };
  }

  clearForm() {
    if (
      confirm('Tem certeza que deseja sair? Dados não salvos serão perdidos.')
    ) {
      this.router.navigate(['/groups']);
    }
  }

  // --- FUNÇÃO DE EXCLUIR EQUIPE CORRIGIDA ---
  remove(certeza = false) {
    if (!certeza) {
      certeza = confirm(
        'Você tem certeza que deseja excluir a equipe? Essa ação não pode ser desfeita.',
      );
    }

    if (!certeza) return;

    // Usamos o this.id capturado da URL para garantir que temos o identificador
    const idParaExcluir =
      this.id || (this.equipeOriginal ? this.equipeOriginal.id : null);

    if (!idParaExcluir) {
      this.sisNotifService.notificar(
        'erro',
        'ID da equipe não encontrado para exclusão',
      );
      return;
    }

    this.equipeService.deleteEquipe(idParaExcluir).subscribe({
      next: () => {
        this.sisNotifService.notificar(
          'sucesso',
          'Equipe excluída com sucesso',
        );
        this.router.navigate(['/groups']); // Redireciona para a listagem
      },
      error: (e) => {
        console.error(e);
        this.sisNotifService.notificar('erro', 'Erro ao excluir equipe');
      },
    });
  }

  removeIntegrante(controlMembro: AbstractControl) {
    if (!this.souLider) {
      this.sisNotifService.notificar(
        'erro',
        'Somente o lider pode remover integrantes da equipe.',
      );
      return;
    }

    const membro = controlMembro.value;
    if (confirm(`Deseja realmente remover o integrante ${membro.nickname}?`)) {
      if (this.equipeOriginal.membros.length == 1) {
        if (
          !confirm(
            'Há apenas esse membro na equipe, caso ele seja removido a equipe também será removida. Deseja continuar?',
          )
        ) {
          return;
        }
      }

      this.equipeService
        .deleteMembro(membro.nickname, this.equipeOriginal.id)
        .subscribe({
          next: (res) => {
            this.sisNotifService.notificar(
              'sucesso',
              `${membro.nickname} removido da equipe`,
            );
            this.buscarDadosEquipe();
          },
          error: (err) => {
            console.error(err);
            this.sisNotifService.notificar(
              'erro',
              `Não foi possível remover ${membro.nickname} da equipe`,
            );
          },
        });
    }
  }

  private buscarResumoUsuarios() {
    this.isLoadingUsuarios = true;
    this.usuarioService.getUsuarios().subscribe({
      next: (res: any[]) => {
        if (!this.equipeOriginal) {
          this.subjectListaUsuarios.next([]);
          this.isLoadingUsuarios = false;
          return;
        }
        const nicknamesMembros = new Set(
          this.equipeOriginal.membros.map((membro) => membro.nickname),
        );
        const usuariosMapeados: UsuarioResumo[] = res.map((user) => ({
          nickname: user.nickname,
          email: user.pessoa?.email ?? '',
          nacionalidade: user.pessoa?.nacionalidade ?? '',
          idade: this.calcularIdade(user.pessoa?.dt_nascimento),
          dias_ativo: user.dias_ativo ?? 0,
          avatarUrl: user?.avatarUrl ?? user?.avatar_url ?? null,
        }));

        usuariosMapeados.forEach((usuario) => {
          this.registrarAvatarPorNickname(usuario.nickname, usuario.avatarUrl ?? usuario.avatar_url ?? null);
        });

        const usuariosNaoMembros = usuariosMapeados.filter(
          (usuario) => !nicknamesMembros.has(usuario.nickname),
        );
        this.subjectListaUsuarios.next(usuariosNaoMembros);
        this.isLoadingUsuarios = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.subjectListaUsuarios.next([]);
        this.isLoadingUsuarios = false;
        this.sisNotifService.notificar('erro', 'Erro ao carregar jogadores');
      },
    });
  }

  openInviteModal() {
    if (!this.souLider) {
      this.sisNotifService.notificar(
        'erro',
        'Somente o lider pode convidar novos integrantes.',
      );
      return;
    }

    this.selectedInviteIds.clear();
    this.filtroUsuariosControl.setValue('');
    this.isInviteModalOpen = true;
    console.log('To aqui trazendo os novos usuarios');
    this.buscarResumoUsuarios();
  }

  cancelInviteModal() {
    this.selectedInviteIds.clear();
    this.filtroUsuariosControl.setValue('');
    this.isInviteModalOpen = false;
  }
  toggleUserSelection(jogador: any) {
    const exists = Array.from(this.selectedInviteIds).some(
      (s) => s.nickname === jogador.nickname,
    );

    if (exists) {
      this.selectedInviteIds = new Set(
        Array.from(this.selectedInviteIds).filter(
          (s) => s.nickname !== jogador.nickname,
        ),
      );
    } else {
      this.selectedInviteIds = new Set([...this.selectedInviteIds, jogador]);
    }
  }

  isUserSelected(nickname: string): boolean {
    return Array.from(this.selectedInviteIds).some(
      (s: any) => s.nickname === nickname,
    );
  }

  saveInvites() {
    if (!this.souLider) {
      this.sisNotifService.notificar(
        'erro',
        'Somente o lider pode convidar novos integrantes.',
      );
      return;
    }

    const selectedIds = Array.from(this.selectedInviteIds) as UsuarioResumo[];

    if (!this.id || selectedIds.length === 0) {
      this.isInviteModalOpen = false;
      return;
    }

    const requests = selectedIds.map((jogador) =>
      this.equipeService.convidarJogador(this.id!, {
        nickname: jogador.nickname,
        is_titular: true,
        is_lider: false,
        funcao: 'player',
      }),
    );

    forkJoin(requests).subscribe({
      next: () => {
        selectedIds.forEach((jogador) => {
          this.sisNotifService.notificar(
            'sucesso',
            `Jogador ${jogador.nickname} convidado`,
          );
        });
        this.selectedInviteIds.clear();
        this.isInviteModalOpen = false;
        this.buscarDadosEquipe(); // só executa quando TODOS os convites terminaram
      },
      error: () => {
        this.sisNotifService.notificar('erro', 'Erro ao convidar jogador(es)');
        this.buscarDadosEquipe();
      },
    });
  }
  convidarJogador(jogador: string) {
    this.equipeService
      .convidarJogador(this.equipeOriginal.id, {
        nickname: jogador,
        is_titular: false,
        is_lider: false,
        funcao: 'jogador',
      })
      .subscribe({
        next: (res) => {
          this.sisNotifService.notificar(
            'sucesso',
            `Jogador ${jogador} convidado`,
          );
        },
        error: (err) => {
          console.log(err);
          this.sisNotifService.notificar('erro', `Erro ao convidar ${jogador}`);
        },
      });
  }

  isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  obterAvatarPorNickname(nickname: string | null | undefined): string {
    const chave = this.normalizarNickname(nickname);
    return this.usuarioService.obterAvatarComFallback(
      chave ? this.avatarPorNickname.get(chave) ?? null : null,
    );
  }

  obterAvatarJogador(jogador: any): string {
    const avatar = jogador?.avatarUrl ?? jogador?.avatar_url ?? null;
    this.registrarAvatarPorNickname(jogador?.nickname, avatar);
    return this.usuarioService.obterAvatarComFallback(avatar);
  }

  //Função para verificar se é líder
  isLiderDaEquipe(equipe: Equipe): boolean {
    const dados = localStorage.getItem('userData');
    if (!dados) return false;

    const { nickname } = JSON.parse(dados);

    return equipe.membros.some((m) => m.nickname === nickname && m.is_lider);
  }

  private registrarAvataresDeMembros(membros: any[]): void {
    (membros ?? []).forEach((membro: any) => {
      const avatar =
        membro?.avatarUrl ??
        membro?.avatar_url ??
        membro?.usuario?.avatarUrl ??
        membro?.usuario?.avatar_url ??
        null;
      this.registrarAvatarPorNickname(membro?.nickname, avatar);
    });
  }

  private registrarAvatarPorNickname(
    nickname: string | null | undefined,
    avatarUrl: string | null | undefined,
  ): void {
    const chave = this.normalizarNickname(nickname);
    if (!chave) return;
    this.avatarPorNickname.set(chave, avatarUrl ?? null);
  }

  private normalizarNickname(nickname: string | null | undefined): string {
    return String(nickname ?? '').trim().toLowerCase();
  }
}
