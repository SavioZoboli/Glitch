import { Component, OnInit } from '@angular/core';
import { InputComponent } from "../../components/input/input";
import { ButtonComponent } from "../../components/button/button";
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { Navigation } from "../../components/navigation/navigation";
import { ActivatedRoute, Router } from '@angular/router';
import { Equipe, EquipeService, Membro } from '../../services/equipe-service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { UsuarioResumo, UsuarioService } from '../../services/usuario-service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatIcon } from "@angular/material/icon";
import { ToggleButtonComponent } from "../../components/toggle-button/toggle.button";
import { textChangeRangeIsUnchanged } from 'typescript';
import { SystemNotificationService } from '../../services/misc/system-notification-service';

@Component({
  selector: 'app-update-team',
  imports: [InputComponent, ButtonComponent, Navigation, ReactiveFormsModule, ToggleButtonComponent, ɵInternalFormsSharedModule,AsyncPipe,CommonModule],
  templateUrl: './update-team.html',
  styleUrl: './update-team.scss'
})
export class UpdateTeam implements OnInit {


  form: FormGroup

  get membrosControls(): FormArray { return this.form.get('membros') as FormArray }
  get nomeControl(): FormControl { return this.form.get('nome') as FormControl }

  public getMembroControl(index: number, controlName: string): FormControl {
    // Pega o FormGroup no índice (ex: o membro na linha 0)
    const formGroup = this.membrosControls.at(index) as FormGroup;

    // Pega o FormControl específico (ex: 'is_lider') dentro daquele grupo
    return formGroup.get(controlName) as FormControl;
  }

  private id: string | null

  souLider: boolean = false

  private equipeOriginal!: Equipe

  private subjectListaUsuarios:Subject<UsuarioResumo[]> = new Subject<UsuarioResumo[]>()
  listaUsuarios:Observable<UsuarioResumo[]> = this.subjectListaUsuarios.asObservable()

  constructor(
    private route: ActivatedRoute,
    private equipeService: EquipeService,
    private usuarioService:UsuarioService,
    private fb: FormBuilder,
    private sisNotifService: SystemNotificationService,
    private router: Router
  ) {
    this.id = this.route.snapshot.paramMap.get('id');

    this.form = new FormGroup({
      nome: this.fb.control('', Validators.required),
      membros: this.fb.array([])
    })

  }

  ngOnInit(): void {
    this.buscarDados()
  }

  buscarDados() {
    this.equipeService.getEquipePorId(this.id).subscribe({
      next: (res: Equipe) => {
        this.carregaDados(res)
        
      }
    })
  }

  carregaDados(equipe: Equipe) {
    let membros = this.formatMembros(equipe.membros)
    if (membros.length == 0) {
      this.remove(true);
      return;
    }
    equipe.membros = membros
    this.buscarResumoUsuarios()
    this.equipeOriginal = equipe
    this.nomeControl.setValue(equipe.nome)
    let liders = membros.filter(m => m.is_lider)
    if (liders.length > 0) {
      let dados = localStorage.getItem('userData') || ''
      let userData = JSON.parse(dados)
      if (userData) {
        liders.forEach(l => {
          if (userData.nickname == l.nickname) {
            this.souLider = true;
          }
        })
      }

    }
    this.geraControls(membros)
  }

  private formatMembros(membros: any) {
    let membrosFormatado: Membro[] = []
    membros.forEach((m: any) => {
      membrosFormatado.push({
        nickname: m.nickname,
        is_lider: m.MembrosEquipe.is_lider,
        is_titular: m.MembrosEquipe.is_titular,
        funcao: m.MembrosEquipe.funcao,
        dt_aceito:m.MembrosEquipe.dt_aceito
      })

    })
    return membrosFormatado;
  }

  private geraControls(membros: Membro[]) {
    let formArray = this.membrosControls
    let index = formArray.length - 1
    while(formArray.length!=0){
      formArray.removeAt(index)
      index--
    }

    membros.forEach(m => {
      this.addMembro(m)
    })
  }

  private addMembro(membro: Membro) {
    let formGroup = new FormGroup({
      nickname: new FormControl(membro.nickname),
      is_lider: new FormControl(membro.is_lider),
      is_titular: new FormControl(membro.is_titular),
      funcao: new FormControl(membro.funcao),
      dt_aceito:new FormControl(membro.dt_aceito||null)
    })
    this.membrosControls.push(formGroup)
  }



  submit() {
    let novosDados = this.form.value

    if (novosDados.nome != this.equipeOriginal.nome) {
      this.equipeService.updateEquipe(this.equipeOriginal.id, novosDados.nome).subscribe({
        next: (res) => {
          this.sisNotifService.notificar('sucesso', 'Nome da equipe alterada')
        },
        error: (e) => {
          console.log(e)
          this.sisNotifService.notificar('erro', 'Erro ao alterar equipe')
        }
      })
    }



    const { atualizados, deletados } = this.identificarAlteracoes();

    atualizados.forEach(a => {
      if (!this.id) {
        return;
      }
      this.equipeService.updateMembro(a, this.id).subscribe({
        next: (res) => {
          console.log(res)
          this.sisNotifService.notificar('sucesso', `Membro ${a.nickname} alterado`)
        },
        error: (e) => {
          console.log(e)
          this.sisNotifService.notificar('erro', `Erro ao alterar ${a.nickname}`)
        }
      })
    })

    deletados.forEach(d => {
      if (!this.id) {
        return;
      }
      this.equipeService.deleteMembro(d, this.id).subscribe({
        next: (res) => {
          this.sisNotifService.notificar('sucesso', `Membro ${d.nickname} removido`)
        },
        error: (e) => {
          this.sisNotifService.notificar('erro', `Erro ao remover ${d.nickname}`)
        }
      })
    })


  }

  private identificarAlteracoes(): { atualizados: Membro[]; deletados: Membro[] } {
    // 1. Pega o estado original (formatado)
    // Usamos a nova variável e a formatamos para ter a mesma estrutura do FormArray
    const membrosOriginais: Membro[] = this.equipeOriginal.membros

    // 2. Pega o estado atual (o que o usuário vê no formulário)
    const membrosAtuais: Membro[] = this.membrosControls.value;

    const membrosAtualizados: Membro[] = [];
    const membrosDeletados: Membro[] = [];

    // 3. Loop 1: Checar por MODIFICAÇÕES
    for (const membroAtual of membrosAtuais) {
      const membroOriginal = membrosOriginais.find(
        (m) => m.nickname === membroAtual.nickname
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
        (m) => m.nickname === membroOriginal.nickname
      );

      if (!aindaExiste) {
        membrosDeletados.push(membroOriginal);
      }
    }

    return { atualizados: membrosAtualizados, deletados: membrosDeletados };
  }

  clearForm() {
    if (confirm("Tem certeza que deseja sair? Dados não salvos serão perdidos.")) {
      this.router.navigate(['/groups'])
    }
  }

  remove(certeza = false) {
    if (!certeza) {
      certeza = confirm("Você tem certeza que deseja excluir a equipe? Essa ação não pode ser desfeita.")
    }
    if (!certeza) {
      return;
    }
    this.equipeService.deleteEquipe(this.equipeOriginal.id).subscribe({
      next: (res) => {
        this.sisNotifService.notificar('sucesso', 'Excluido com sucesso')
        this.router.navigate(['/groups'])
      },
      error: (e) => {
        console.log(e)
        this.sisNotifService.notificar('erro', 'Erro ao excluir')
      }
    })
  }

  removeIntegrante(controlMembro: AbstractControl) {
    let membro = controlMembro.value;
    if (confirm(`Deseja realmente remover o integrante ${membro.nickname}?`)) {
      if (this.equipeOriginal.membros.length == 1) {
        if (!confirm("Há apenas esse membro na equipe, caso ele seja removido a equipe também será removida. Deseja continuar?")) {
          return;
        }
      }

      this.equipeService.deleteMembro(membro, this.equipeOriginal.id).subscribe({
        next: (res) => {
          this.sisNotifService.notificar('sucesso', `${membro.nickname} removido da equipe`)
          this.buscarDados()
        },
        error: (err) => {
          console.error(err)
          this.sisNotifService.notificar('erro', `Não foi possível remover ${membro.nickname} da equipe`)
        }
      })

    }
  }

  private buscarResumoUsuarios(){
    this.usuarioService.getUsuariosResumido().subscribe({
      next:(res)=>{
        const nicknamesMembros = new Set(this.equipeOriginal.membros.map(membro => membro.nickname));
        const usuariosNaoMembros = res.filter(
          (usuario:UsuarioResumo) => !nicknamesMembros.has(usuario.nickname)
        );
        this.subjectListaUsuarios.next(usuariosNaoMembros)
      }
    })
  }

convidarJogador(jogador: string) {
    this.equipeService.convidarJogador(this.equipeOriginal.id, jogador).subscribe({
      next: (res) => {
        this.sisNotifService.notificar('sucesso', `Jogador ${jogador} convidado`)
      },
      error: (err) => {
        console.log(err)
        this.sisNotifService.notificar('erro', `Erro ao convidar ${jogador}`)
      }
    })
  }


}
