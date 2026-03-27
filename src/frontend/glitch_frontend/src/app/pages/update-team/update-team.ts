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
import { ToggleButtonComponent } from "../../components/toggle-button/toggle.button";
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
  filtroControl:FormControl = new FormControl();

  public getMembroControl(index: number, controlName: string): FormControl {
    // Pega o FormGroup no índice (ex: o membro na linha 0)
    const formGroup = this.membrosControls.at(index) as FormGroup;

    // Pega o FormControl específico (ex: 'is_lider') dentro daquele grupo
    return formGroup.get(controlName) as FormControl;
  }

  private id: string | null

  souLider: boolean = false

  private controlesGerados:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private controlesGerados$:Observable<boolean> = this.controlesGerados.asObservable();

  private alteracoesPendentes:BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  private alteracoesPendentes$:Observable<number> = this.alteracoesPendentes.asObservable()

  private equipeOriginal!: Equipe

  jogadores$:BehaviorSubject<UsuarioResumo[]> = new BehaviorSubject<UsuarioResumo[]>([])
  jogadoresFiltrado$:BehaviorSubject<UsuarioResumo[]> = new BehaviorSubject<UsuarioResumo[]>([])

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

    this.controlesGerados$.subscribe((val)=>{
      if(val){
        this.filtraJogadores();
      }
    })

    this.filtroControl.valueChanges.subscribe((val) => {
      this.filtraJogadores(val);
    });

    this.alteracoesPendentes$.subscribe((val)=>{
      if(val == 0){
        this.sisNotifService.notificar('info','Todas as alterações salvas')
        this.router.navigate(['/groups'])
      }
    })

  }

  ngOnInit(): void {
    this.buscarDadosEquipe()
    this.buscarResumoUsuarios()
  }

  buscarDadosEquipe() {
    this.equipeService.getEquipePorId(this.id).subscribe({
      next: (res: Equipe) => {
        this.equipeOriginal = res;
        this.nomeControl.setValue(res.nome);
        this.id = res.id;
        this.geraControls()
        this.amILider()
      }
    })
  }

  private amILider(){
    let eu = localStorage.getItem('userData') || ''
    let euObject = JSON.parse(eu)
    if(!eu){
      return;
    }
    this.equipeOriginal.membros.forEach(m=>{
      if(m.nickname == euObject.nickname){
        this.souLider = m.is_lider
      }
    })
  }


  private geraControls() {
    let membros:Membro[] = this.equipeOriginal.membros
    let formArray = this.membrosControls
    let index = formArray.length - 1
    while(formArray.length!=0){
      formArray.removeAt(index)
      index--
    }

    membros.forEach(m => {
      this.addMembro(m)
    })

    this.controlesGerados.next(true)
  }

  private addMembro(membro: Membro) {
    let formGroup = new FormGroup({
      nickname: new FormControl(membro.nickname),
      is_lider: new FormControl(membro.is_lider),
      is_titular: new FormControl(membro.is_titular),
      funcao: new FormControl(membro.funcao),
      dt_aceito:new FormControl(membro.dt_aceito||null),
      status:new FormControl(membro.dt_aceito?'MEMBRO':'PENDENTE')
    })
    this.membrosControls.push(formGroup)
  }



  submit() {
    let novosDados = this.form.value

    if (novosDados.nome != this.equipeOriginal.nome) {
      this.alteracoesPendentes.next(1)
      this.equipeService.updateEquipe(this.equipeOriginal.id, novosDados.nome).subscribe({
        next: (res) => {
          this.sisNotifService.notificar('sucesso', 'Nome da equipe alterada')
          this.alteracoesPendentes.next(this.alteracoesPendentes.value - 1)
        },
        error: (e) => {
          console.log(e)
          this.sisNotifService.notificar('erro', 'Erro ao alterar equipe')
        }
      })
    }

    let atualizados:Membro[] = this.membrosControls.value.filter((m:any)=>m.status=='PENDENTE' || m.status =='MEMBRO')
    let novos:Membro[] = this.membrosControls.value.filter((m:any)=>m.status=='NOVO')
    this.alteracoesPendentes.next(this.alteracoesPendentes.value + atualizados.length + novos.length)

    atualizados.forEach(a => {
      if (!this.id) {
        return;
      }
      this.equipeService.updateMembro(a, this.id).subscribe({
        next: (res) => {
          console.log(res)
          this.sisNotifService.notificar('sucesso', `Membro ${a.nickname} alterado`)
          this.alteracoesPendentes.next(this.alteracoesPendentes.value - 1)
        },
        error: (e) => {
          console.log(e)
          this.sisNotifService.notificar('erro', `Erro ao alterar ${a.nickname}`)
        }
      })
    })

    novos.forEach(n=>{
      if(!this.id){
        return;
      }
      this.equipeService.convidarJogador(this.id,n).subscribe({
        next:(res)=>{
          this.sisNotifService.notificar('sucesso',`Usuário ${n.nickname} convidado`)
          this.alteracoesPendentes.next(this.alteracoesPendentes.value - 1)
        },
        error:(e)=>{
          this.sisNotifService.notificar('erro',`Não foi possível convidar o usuário ${n.nickname}`)
          console.error(e)
        }
      })
    })

  }

  clearForm() {
    if (confirm("Tem certeza que deseja sair? Dados não salvos serão perdidos.")) {
      this.router.navigate(['/groups'])
    }
  }

  remove() {
    if (!confirm("Você tem certeza que deseja excluir a equipe? Essa ação não pode ser desfeita.")) {
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

  removeIntegrante(index: number) {
    let status = this.getMembroControl(index,'status').value;
    if(status == 'NOVO'){
      this.membrosControls.removeAt(index)
      this.filtraJogadores()
      return;
    }
    let nickname = this.getMembroControl(index,'nickname').value
    if (confirm(`Deseja realmente remover o integrante ${nickname}?`)) {



      this.equipeService.deleteMembro(nickname, this.equipeOriginal.id).subscribe({
        next: (res) => {
          this.sisNotifService.notificar('sucesso', `${nickname} removido da equipe`)
          this.buscarDadosEquipe()
        },
        error: (err) => {
          console.error(err)
          this.sisNotifService.notificar('erro', `Não foi possível remover ${nickname} da equipe`)
        }
      })

    }
  }

  private buscarResumoUsuarios(){
    this.usuarioService.getUsuariosResumido().subscribe({
      next:(res)=>{
        this.jogadores$.next(res)
        this.filtraJogadores()
      }
    })
  }

  filtraJogadores(filtro: string | '' = '') {
    let jogadores = this.jogadores$.getValue();
    let convidados = this.membrosControls.value;
     let filtrado = jogadores.filter((j) =>
        j.nickname.toLowerCase().includes(filtro.toLowerCase()) &&
        !convidados.some((c:{nickname:string,is_titular:boolean,is_lider:boolean,funcao:string})=>c.nickname == j.nickname)
      );
      this.jogadoresFiltrado$.next(filtrado);
  }

pushConvidado(nickname: string) {
    let novo_membro = new FormGroup({
      nickname: new FormControl(nickname),
      is_titular: new FormControl(false),
      is_lider: new FormControl(false),
      funcao: new FormControl(''),
      dt_aceito:new FormControl(null),
      status:new FormControl('NOVO')
    });

    this.membrosControls.push(novo_membro);

    this.filtraJogadores()
  }

convidarJogador(jogador: any) {
    this.equipeService.convidarJogador(this.equipeOriginal.id, jogador).subscribe({
      next: (res) => {
        this.sisNotifService.notificar('sucesso', `Jogador ${jogador.nickname} convidado`)
      },
      error: (err) => {
        console.log(err)
        this.sisNotifService.notificar('erro', `Erro ao convidar ${jogador}`)
      }
    })
  }


}
