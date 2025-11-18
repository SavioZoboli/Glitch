import { Component } from '@angular/core';
import { Navigation } from "../../components/navigation/navigation";
import { ButtonComponent } from "../../components/button/button";
import { InputComponent } from "../../components/input/input";
import { FormControl, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CompetitorLevelComponent } from "../../components/toggle-group/toggle-group";
import { ThemeToggler } from "../../components/theme-toggler/theme-toggler";
import { ToggleButtonComponent } from "../../components/toggle-button/toggle.button"
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import { Router } from '@angular/router';
import { TournamentService } from '../../services/tournament-service';

@Component({
  selector: 'app-create-tournament',
  standalone: true,
  imports: [
  ReactiveFormsModule,
  LucideAngularModule ,
  InputComponent,
  CompetitorLevelComponent,
  ToggleButtonComponent,
  ButtonComponent,
  Navigation,
  ThemeToggler
  ],
  templateUrl: './create-tournament.html',
  styleUrls: ['./create-tournament.scss']
})

export class CreateTournament {
  constructor(
    private sysNotifService: SystemNotificationService, private router: Router,
    private tournamentService: TournamentService
  ) {}

  ngOnInit() {
    if (!localStorage.getItem('username')) {
      localStorage.setItem('username', 'JogadorTeste');
    }

    this.form.get('typeGroup')?.valueChanges.subscribe((tipo) => {
      const qtdGrupos = this.form.get('quantityGroups');
      if (!qtdGrupos) return;

      if (tipo === 'Solo') {
        qtdGrupos.clearValidators();
        this.showGroupFields = false; // Esconde
      } else {
        qtdGrupos.setValidators([Validators.required, Validators.pattern(/^[0-9]+$/)]);
        this.showGroupFields = true; // Mostra
      }

      qtdGrupos.updateValueAndValidity();
    });
  }
  
  showGroupFields = true;

  submit() {
    if (this.form.valid) {
      const dados = {
        nome_torneio: this.tournamentNameControl.value,
        jogo: this.gameNameControl.value,
        data_realizacao: this.tournamentDateControl.value,
        data_inscricao: this.registrationsDateControl.value,
        nivel_competidor: this.competitorLevelControl.value,
        tipo_competicao: this.typeCompetitionControl.value,
        tipo_ranking: this.typeRankingLevelControl.value,
        tipo_local: this.typePlaceTournamentControl.value,
        endereco: this.addressTournamentControl.value,
        numero: this.addressNumberTournamentControl.value,
        bairro: this.neighborhoodTournamentControl.value,
        cidade: this.cityTournamentControl.value,
        estado: this.stateTournamentControl.value,
        cep: this.cepTournamentControl.value,
        participantes_min: this.minParticipantsControl.value,
        participantes_max: this.maxParticipantsControl.value,
        grupos: this.quantityGroupsControl.value,
        ingresso: this.ticketTournamentControl.value,
        criador: localStorage.getItem('username') || 'JogadorTeste',
      };

      console.log('Dados do torneio:', dados);

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

      this.tournamentService.addTournament(dados);
      this.sysNotifService.notificar('sucesso', 'Cadastro realizado com sucesso!');
      this.sysNotifService.notificar('info', 'Seu torneio foi salvo e está pronto para ser gerenciado.');
      this.router.navigate(['/tournaments']);

      setTimeout(() => {
      }, 8000);

      this.form.reset();

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
      Validators.minLength(2),
      Validators.maxLength(30)
    ]),
    tournamentDate: new FormControl('', [
      Validators.required,
      this.dateNotPastValidator()
    ]),
    registrationsDate: new FormControl('', [
      Validators.required, 
      this.dateNotPastValidator(),
    ]),

    competitorLevel: new FormControl('', [Validators.required]),
    typeCompetition: new FormControl('', [Validators.required]),
    typeRanking: new FormControl('', [Validators.required]),
    typePlaceTournament: new FormControl('', [Validators.required]),

    addressTournament: new FormControl(''),
    addressNumberTournament: new FormControl(''),
    neighborhoodTournament: new FormControl(''),
    cityTournament: new FormControl(''),
    stateTournament: new FormControl(''),

    cepTournament: new FormControl('', [
      Validators.pattern(/^\d{8}$/),
    ]),
    minParticipants: new FormControl('', [
      Validators.required, 
      Validators.pattern(/^[0-9]+$/)
    ]),
    maxParticipants: new FormControl('', [
      Validators.required, 
      Validators.pattern(/^[0-9]+$/)
    ]),

    registrationAvailable: new FormControl(false),

    typeGroup: new FormControl('', [
      Validators.required
    ]),
    quantityGroups: new FormControl('', [
      Validators.required, 
      Validators.pattern(/^[0-9]+$/)
    ]),

    randomizeGroups: new FormControl(false),
    entryOnlyGroups: new FormControl(false),

    ticketTournament: new FormControl('', [
      Validators.required, 
      Validators.pattern(/^[0-9]+$/)
    ])   
  });

    get tournamentNameControl() { return this.form.get('tournamentName') as FormControl; }
    get gameNameControl() { return this.form.get('gameName') as FormControl; }
    get tournamentDateControl() { return this.form.get('tournamentDate') as FormControl; }
    get competitorLevelControl() { return this.form.get('competitorLevel') as FormControl; }
    get typeCompetitionControl() { return this.form.get('typeCompetition') as FormControl; }
    get typeRankingLevelControl() { return this.form.get('typeRanking') as FormControl; }
    get typePlaceTournamentControl() { return this.form.get('typePlaceTournament') as FormControl; }
    get addressTournamentControl() { return this.form.get('addressTournament') as FormControl; }
    get addressNumberTournamentControl() { return this.form.get('addressNumberTournament') as FormControl; }
    get neighborhoodTournamentControl() { return this.form.get('neighborhoodTournament') as FormControl; }
    get cityTournamentControl() { return this.form.get('cityTournament') as FormControl; }
    get stateTournamentControl() { return this.form.get('stateTournament') as FormControl; }
    get cepTournamentControl() { return this.form.get('cepTournament') as FormControl; }
    get minParticipantsControl() { return this.form.get('minParticipants') as FormControl; }
    get maxParticipantsControl() { return this.form.get('maxParticipants') as FormControl; }
    get registrationsDateControl() { return this.form.get('registrationsDate') as FormControl; }
    get registrationAvailableControl() { return this.form.get('registrationAvailable') as FormControl; }
    get typeGroupControl () { return this.form.get('typeGroup') as FormControl; }
    get quantityGroupsControl() { return this.form.get('quantityGroups') as FormControl; }
    get randomizeGroupsControl() { return this.form.get('randomizeGroups') as FormControl; }
    get entryOnlyGroupsControl() { return this.form.get('entryOnlyGroups') as FormControl; }
    get ticketTournamentControl() { return this.form.get('ticketTournament') as FormControl; }

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