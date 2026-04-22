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
import { Navigation } from '../../components/navigation/navigation';
import { ActivatedRoute, Router } from '@angular/router';
import { Equipe, EquipeService, Membro } from '../../services/equipe-service';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  map,
  startWith,
} from 'rxjs';
import { UsuarioResumo, UsuarioService } from '../../services/usuario-service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ToggleButtonComponent } from '../../components/toggle-button/toggle.button';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-update-team',
  standalone: true,
  imports: [
    InputComponent,
    ButtonComponent,
    Navigation,
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

  get membrosControls(): FormArray {
    return this.form.get('membros') as FormArray;
  }
  get nomeControl(): FormControl {
    return this.form.get('nome') as FormControl;
  }

  public getMembroControl(index: number, controlName: string): FormControl {
    const formGroup = this.membrosControls.at(index) as FormGroup;
    return formGroup.get(controlName) as FormControl;
  }

  private id: string | null;
  souLider: boolean = false;
  private equipeOriginal!: Equipe;

  private subjectListaUsuarios = new BehaviorSubject<UsuarioResumo[]>([]);
  listaUsuarios: Observable<UsuarioResumo[]> = this.subjectListaUsuarios.asObservable();
  listaUsuariosFiltrada: Observable<UsuarioResumo[]>;

  filtroUsuariosControl = new FormControl('');
  isInviteModalOpen = false;
  selectedInviteIds: Set<string> = new Set<string>();
  isLoadingUsuarios = false;

  constructor(
    private route: ActivatedRoute,
    private equipeService: EquipeService,
    private usuarioService: UsuarioService,
    private fb: FormBuilder,
    private sisNotifService: SystemNotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
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
        if (!termo) return usuarios;
        return usuarios.filter((usuario) =>
          usuario.nickname.toLowerCase().includes(termo),
        );
      }),
    );
  }

  ngOnInit(): void {
    this.buscarDados();
  }

  buscarDados() {
    this.equipeService.getEquipePorId(this.id).subscribe({
      next: (res: Equipe) => {
        this.carregaDados(res);
      },
    });
  }

  carregaDados(equipe: Equipe) {
    let membros = this.formatMembros(equipe.membros);
    if (membros.length == 0) {
      this.remove(true);
      return;
    }
    equipe.membros = membros;
    this.buscarResumoUsuarios();
    this.equipeOriginal = equipe;
    this.nomeControl.setValue(equipe.nome);
    
    let liders = membros.filter((m) => m.is_lider);
    if (liders.length > 0) {
      let dados = localStorage.getItem('userData') || '';
      let userData = dados ? JSON.parse(dados) : null;
      if (userData) {
        this.souLider = liders.some(l => l.nickname === userData.nickname);
      }
    }
    this.geraControls(membros);
  }

  private formatMembros(membros: any) {
    let membrosFormatado: Membro[] = [];
    membros.forEach((m: any) => {
      membrosFormatado.push({
        nickname: m.nickname,
        is_lider: m.MembrosEquipe.is_lider,
        is_titular: m.MembrosEquipe.is_titular,
        funcao: m.MembrosEquipe.funcao,
        dt_aceito: m.MembrosEquipe.dt_aceito,
      });
    });
    return membrosFormatado;
  }

  private geraControls(membros: Membro[]) {
    this.membrosControls.clear();
    membros.forEach((m) => {
      this.addMembro(m);
    });
  }

  private addMembro(membro: Membro) {
    let formGroup = new FormGroup({
      nickname: new FormControl(membro.nickname),
      is_lider: new FormControl(membro.is_lider),
      is_titular: new FormControl(membro.is_titular),
      funcao: new FormControl(membro.funcao),
      dt_aceito: new FormControl(membro.dt_aceito || null),
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
    let novosDados = this.form.value;
    const { atualizados, deletados } = this.identificarAlteracoes();
    const nomeMudou = novosDados.nome != this.equipeOriginal.nome;

    if (!nomeMudou && atualizados.length === 0 && deletados.length === 0) {
      this.sisNotifService.notificar('info', 'Nenhuma alteração foi feita');
      return;
    }

    if (nomeMudou) {
      this.equipeService.updateEquipe(this.equipeOriginal.id, novosDados.nome).subscribe({
        next: () => this.sisNotifService.notificar('sucesso', 'Nome da equipe atualizado'),
        error: () => this.sisNotifService.notificar('erro', 'Erro ao alterar nome da equipe')
      });
    }

    atualizados.forEach((a) => {
      this.equipeService.updateMembro(a, this.id!).subscribe({
        next: () => this.sisNotifService.notificar('sucesso', `Membro ${a.nickname} alterado`),
        error: () => this.sisNotifService.notificar('erro', `Erro ao alterar ${a.nickname}`)
      });
    });

    deletados.forEach((d) => {
      this.equipeService.deleteMembro(d.nickname, this.id!).subscribe({
        next: () => this.sisNotifService.notificar('sucesso', `Membro ${d.nickname} removido`),
        error: () => this.sisNotifService.notificar('erro', `Erro ao remover ${d.nickname}`)
      });
    });
  }

  private identificarAlteracoes() {
    const membrosOriginais = this.equipeOriginal.membros;
    const membrosAtuais = this.membrosControls.value;
    const atualizados: Membro[] = [];
    const deletados: Membro[] = [];

    for (const membroAtual of membrosAtuais) {
      const original = membrosOriginais.find(m => m.nickname === membroAtual.nickname);
      if (original) {
        const mudou = original.is_lider !== membroAtual.is_lider ||
                      original.is_titular !== membroAtual.is_titular ||
                      original.funcao !== membroAtual.funcao;
        if (mudou) atualizados.push(membroAtual);
      }
    }

    for (const original of membrosOriginais) {
      if (!membrosAtuais.find((m: any) => m.nickname === original.nickname)) {
        deletados.push(original);
      }
    }
    return { atualizados, deletados };
  }

  clearForm() {
    if (confirm('Tem certeza que deseja sair? Dados não salvos serão perdidos.')) {
      this.router.navigate(['/groups']);
    }
  }

  // --- FUNÇÃO DE EXCLUIR EQUIPE CORRIGIDA ---
  remove(certeza = false) {
    if (!certeza) {
      certeza = confirm('Você tem certeza que deseja excluir a equipe? Essa ação não pode ser desfeita.');
    }
    
    if (!certeza) return;

    // Usamos o this.id capturado da URL para garantir que temos o identificador
    const idParaExcluir = this.id || (this.equipeOriginal ? this.equipeOriginal.id : null);

    if (!idParaExcluir) {
      this.sisNotifService.notificar('erro', 'ID da equipe não encontrado para exclusão');
      return;
    }

    this.equipeService.deleteEquipe(idParaExcluir).subscribe({
      next: () => {
        this.sisNotifService.notificar('sucesso', 'Equipe excluída com sucesso');
        this.router.navigate(['/groups']); // Redireciona para a listagem
      },
      error: (e) => {
        console.error(e);
        this.sisNotifService.notificar('erro', 'Erro ao excluir equipe');
      },
    });
  }

  removeIntegrante(controlMembro: AbstractControl) {
    let membro = controlMembro.value;
    if (confirm(`Deseja realmente remover o integrante ${membro.nickname}?`)) {
      const idEquipe = this.id || this.equipeOriginal.id;
      
      this.equipeService.deleteMembro(membro.nickname, idEquipe).subscribe({
        next: () => {
          this.sisNotifService.notificar('sucesso', `${membro.nickname} removido da equipe`);
          this.buscarDados();
        },
        error: (err) => {
          console.error(err);
          this.sisNotifService.notificar('erro', `Não foi possível remover ${membro.nickname}`);
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
        const nicknamesMembros = new Set(this.equipeOriginal.membros.map(m => m.nickname));
        const usuariosMapeados: UsuarioResumo[] = res.map(user => ({
          nickname: user.nickname,
          email: user.pessoa?.email ?? '',
          nacionalidade: user.pessoa?.nacionalidade ?? '',
          idade: this.calcularIdade(user.pessoa?.dt_nascimento),
          dias_ativo: user.dias_ativo ?? 0,
        }));

        this.subjectListaUsuarios.next(usuariosMapeados.filter(u => !nicknamesMembros.has(u.nickname)));
        this.isLoadingUsuarios = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.subjectListaUsuarios.next([]);
        this.isLoadingUsuarios = false;
        this.sisNotifService.notificar('erro', 'Erro ao carregar jogadores');
      },
    });
  }

  openInviteModal() {
    this.selectedInviteIds.clear();
    this.filtroUsuariosControl.setValue('');
    this.isInviteModalOpen = true;
    this.buscarResumoUsuarios();
  }

  cancelInviteModal() {
    this.isInviteModalOpen = false;
  }

  toggleUserSelection(nickname: string) {
    if (this.selectedInviteIds.has(nickname)) {
      this.selectedInviteIds.delete(nickname);
    } else {
      this.selectedInviteIds.add(nickname);
    }
  }

  isUserSelected(nickname: string): boolean {
    return this.selectedInviteIds.has(nickname);
  }

  saveInvites() {
    const selectedIds = Array.from(this.selectedInviteIds);
    if (!this.id || selectedIds.length === 0) {
      this.isInviteModalOpen = false;
      return;
    }

    const requests = selectedIds.map(nick =>
      this.equipeService.convidarJogador(this.id!, {
        nickname: nick,
        is_titular: false,
        is_lider: false,
        funcao: 'jogador',
      })
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.sisNotifService.notificar('sucesso', 'Convites enviados');
        this.selectedInviteIds.clear();
        this.isInviteModalOpen = false;
        this.buscarDados();
      },
      error: () => {
        this.sisNotifService.notificar('erro', 'Erro ao convidar jogador(es)');
        this.buscarDados();
      },
    });
  }
}