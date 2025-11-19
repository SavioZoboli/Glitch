import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { InputComponent } from '../../components/input/input';
import { CompetitorLevelComponent } from '../../components/toggle-group/toggle-group';
import { ToggleButtonComponent } from '../../components/toggle-button/toggle.button';
import { ButtonComponent } from '../../components/button/button';
import { ThemeToggler } from '../../components/theme-toggler/theme-toggler';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentService } from '../../services/tournament-service';
import { UsuarioService } from '../../services/usuario-service';
import { JogoService } from '../../services/jogo-service';
import { Navigation } from "../../components/navigation/navigation";
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-update-tournament',
  imports: [
    ReactiveFormsModule,
    InputComponent,
    CompetitorLevelComponent,
    ButtonComponent,
    ThemeToggler,
    Navigation
],providers:[DatePipe],
  templateUrl: './update-tournament.html',
  styleUrl: './update-tournament.scss'
})
export class UpdateTournament {

  private id:string = ''

 constructor(
    private sysNotifService: SystemNotificationService, private router: Router,
    private tournamentService: TournamentService,
    private usuarioService: UsuarioService,
    private route:ActivatedRoute,
    private datePipe:DatePipe
  ) { 
    this.id = this.route.snapshot.paramMap.get('id')||'';
    this.buscarDadosTorneio()
  }

  buscarDadosTorneio(){
    this.tournamentService.getTorneioById(this.id).subscribe({
      next:(res)=>{
        console.log(res)
        this.tournamentNameControl.setValue(res.nome)
        this.gameNameControl.setValue(res.jogo.nome)
        this.tournamentDateControl.setValue(this.datePipe.transform(res.dt_inicio,'yyyy-MM-dd'))
        this.descriptionControl.setValue(res.descricao)
        this.maxParticipantsControl.setValue(res.configuracao_inscricao.qtd_participantes_max)
        this.registrationsDateControl.setValue(this.datePipe.transform(res.configuracao_inscricao.dt_fim,'yyyy-MM-dd'))
        this.typeGroupControl.setValue(res.configuracao_inscricao.modo_inscricao)
      },
      error:(err)=>{
        this.sysNotifService.notificar('erro','Erro ao buscar dados')
      }
    })
  }


  submit() {
    if (this.form.valid) {
      const dados = {
        id:this.id,
        nome: this.tournamentNameControl.value,
        descricao:this.descriptionControl.value,
        dt_inicio: this.tournamentDateControl.value,
        inscricao: {
          dt_fim: this.registrationsDateControl.value,
          modo_inscricao: this.typeGroupControl.value,
          max_participantes: this.maxParticipantsControl.value,
        },
      };

      console.log('Dados do torneio:', dados);


      this.tournamentService.updateTournament(dados).subscribe({
        next: (res) => {
          this.sysNotifService.notificar('sucesso', 'Cadastro atualizado com sucesso!');
          this.sysNotifService.notificar('info', 'Seu torneio foi salvo e está pronto para ser gerenciado.');
          this.form.reset();
          this.router.navigate(['/tournaments']);
          
        },
        error: (error) => {
          console.error(error)
          this.sysNotifService.notificar('erro', 'Erro ao editar torneio');
        }
      });

      

    } else {
      console.log('Formulário inválido. Campos com erro:');
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.log(`Campo inválido: ${key}`, control.errors);
        }
      });

      this.form.markAllAsTouched();
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        this.sysNotifService.notificar('erro', 'Preencha todos os campos obrigatórios antes de continuar.');
      }, 100);
    }
  }

  dateNotPastValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const selectedDateStr = control.value;
      return selectedDateStr < todayStr ? { pastDate: true } : null;
    };
  }

  registrationBeforeTournamentValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const tournamentDate = group.get('tournamentDate')?.value;
      const registrationsDate = group.get('registrationsDate')?.value;
      if (!tournamentDate || !registrationsDate) return null;
      return registrationsDate > tournamentDate ? { registrationAfterTournament: true } : null;
    };
  }


  form = new FormGroup({
    tournamentName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ]),
    gameName: new FormControl('', [
      Validators.required,
    ]),
    tournamentDate: new FormControl('', [
      Validators.required,
      this.dateNotPastValidator()
    ]),

    description: new FormControl(''),

    registrationsDate: new FormControl('', [
      Validators.required,
      this.dateNotPastValidator(),
    ]),

    competitorLevel: new FormControl('',),
    typeCompetition: new FormControl('',),
    typeRanking: new FormControl('',),
    typePlaceTournament: new FormControl('',),

    addressTournament: new FormControl(''),
    addressNumberTournament: new FormControl(''),
    neighborhoodTournament: new FormControl(''),
    cityTournament: new FormControl(''),
    stateTournament: new FormControl(''),

    cepTournament: new FormControl('', [
      Validators.pattern(/^\d{8}$/),
    ]),
    minParticipants: new FormControl('', [
      Validators.pattern(/^[0-9]+$/)
    ]),
    maxParticipants: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[0-9]+$/)
    ]),

    registrationAvailable: new FormControl(true),

    typeGroup: new FormControl('', [
      Validators.required
    ]),
    quantityGroups: new FormControl('', [
      Validators.pattern(/^[0-9]+$/)
    ]),

    randomizeGroups: new FormControl(false),
    entryOnlyGroups: new FormControl(false),

    ticketTournament: new FormControl('', [
      Validators.pattern(/^[0-9]+$/)
    ])
  });

  get tournamentNameControl() { return this.form.get('tournamentName') as FormControl; }
  get gameNameControl() { return this.form.get('gameName') as FormControl; }
  get tournamentDateControl() { return this.form.get('tournamentDate') as FormControl; }
  get descriptionControl() { return this.form.get('description') as FormControl }
  get minParticipantsControl() { return this.form.get('minParticipants') as FormControl; }
  get maxParticipantsControl() { return this.form.get('maxParticipants') as FormControl; }
  get registrationsDateControl() { return this.form.get('registrationsDate') as FormControl; }
  get typeGroupControl() { return this.form.get('typeGroup') as FormControl; }

  checkDates(): boolean {
    const tournament = this.form.get('tournamentDate')?.value;
    const registration = this.form.get('registrationsDate')?.value;

    if (!tournament || !registration) return false;

    const t = new Date(tournament);
    const r = new Date(registration);

    return r > t;
  }

  validateDates() {
    const tournament = this.tournamentDateControl.value;
    const registration = this.registrationsDateControl.value;

    if (!tournament || !registration) {
      this.tournamentDateControl.setErrors(null);
      this.registrationsDateControl.setErrors(null);
      return;
    }

    const tournamentDate = new Date(tournament);
    const registrationDate = new Date(registration);

    if (registrationDate > tournamentDate) {
      this.registrationsDateControl.setErrors({ afterTournament: true });
      this.tournamentDateControl.setErrors({ beforeRegistration: true });
    } else {
      this.registrationsDateControl.setErrors(null);
      this.tournamentDateControl.setErrors(null);
    }
  }
}
