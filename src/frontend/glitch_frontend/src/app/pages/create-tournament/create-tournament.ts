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
import { UsuarioService } from '../../services/usuario-service';
import { JogoService } from '../../services/jogo-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-tournament',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    InputComponent,
    CompetitorLevelComponent,
    ToggleButtonComponent,
    ButtonComponent,
    Navigation,
    ThemeToggler,
    CommonModule,
  ],
  templateUrl: './create-tournament.html',
  styleUrls: ['./create-tournament.scss']
})

export class CreateTournament {
  constructor(
    private sysNotifService: SystemNotificationService, private router: Router,
    private tournamentService: TournamentService,
    private usuarioService: UsuarioService,
    private jogoService:JogoService
  ) { }

  ngOnInit() {
    this.buscarJogos()

    this.typePlaceTournamentControl.valueChanges.subscribe((value) => {
      this.updateAddressValidators(value);
    });

   this.typeGroupControl.valueChanges.subscribe((value) => {
    this.updateGroupValidators(value);
  });
  }

   updateAddressValidators(tipoLocal: string) {
    const isPresencial = tipoLocal === 'Presencial';

    const addressControls = [
      this.addressTournamentControl,
      this.addressNumberTournamentControl,
      this.neighborhoodTournamentControl,
      this.cityTournamentControl,
      this.stateTournamentControl
    ];


    addressControls.forEach(control => {
      if (isPresencial) {
        control.setValidators([Validators.required]);
      } else {
        control.setValidators([]);
      }
      control.updateValueAndValidity();
    });
  }

updateGroupValidators(tipoGrupo: string) {
  const isGrupo = tipoGrupo === 'Grupo';

  const groupControls = [
    this.quantityGroupsControl,
    this.randomizeGroupsControl,
    this.entryOnlyGroupsControl
  ];

  groupControls.forEach(control => {
    if (isGrupo) {
      control.setValidators([Validators.required]);
    } else {
      control.setValidators([]);
    }
    control.updateValueAndValidity();
  });
}
  submit() {
    if (this.form.valid) {
      const dados = {
        nome: this.tournamentNameControl.value,
        descricao:this.descriptionControl.value,
        jogo_id: this.gameNameControl.value,
        usuario_responsavel: this.usuarioService.getUsuarioLogado()?.nickname,
        dt_inicio: this.tournamentDateControl.value,
        inscricao: {
          dt_fim: this.registrationsDateControl.value,
          modo_inscricao: this.typeGroupControl.value,
          max_participantes: this.maxParticipantsControl.value,
        },
      };

      this.tournamentService.addTournament(dados).subscribe({
        next: (res) => {
          this.sysNotifService.notificar('sucesso', 'Cadastro realizado com sucesso!');
          this.sysNotifService.notificar('info', 'Seu torneio foi salvo e está pronto para ser gerenciado.');
          this.form.reset();
          this.router.navigate(['/tournaments']);
        },
        error: (error) => {
          console.error(error)
          this.sysNotifService.notificar('erro', 'Erro ao cadastrar torneio');
        }
      });

    } else {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
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

    const t = new Date(tournamentDate);
    const r = new Date(registrationsDate);

    return r > t ? { registrationAfterTournament: true } : null;
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

description: new FormControl('', [
  Validators.pattern(/^[^0-9]*$/)
]),
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
    ]),

    trophyTournament: new FormControl('', [
      Validators.pattern(/^[0-9]+$/)
    ]),

    paidTicket: new FormControl(false),

collectPlatform: new FormControl(''),
streamPlatform: new FormControl(''),
chat: new FormControl(false),
badges: new FormControl(false),
narration: new FormControl(false),
},
{
  validators: this.registrationBeforeTournamentValidator()
});

  get tournamentNameControl() { return this.form.get('tournamentName') as FormControl; }
  get gameNameControl() { return this.form.get('gameName') as FormControl; }
  get tournamentDateControl() { return this.form.get('tournamentDate') as FormControl; }
  get descriptionControl() { return this.form.get('description') as FormControl }
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
  get typeGroupControl() { return this.form.get('typeGroup') as FormControl; }
  get quantityGroupsControl() { return this.form.get('quantityGroups') as FormControl; }
  get randomizeGroupsControl() { return this.form.get('randomizeGroups') as FormControl; }
  get entryOnlyGroupsControl() { return this.form.get('entryOnlyGroups') as FormControl; }
  get ticketTournamentControl() { return this.form.get('ticketTournament') as FormControl; }
  get trophyTournamentControl() { return this.form.get('trophyTournament') as FormControl; }
  get paidTicketControl() { return this.form.get('paidTicket') as FormControl; }
  get collectPlatformControl() { return this.form.get('collectPlatform') as FormControl; }
  get streamPlatformControl() { return this.form.get('streamPlatform') as FormControl; }
  get chatControl() { return this.form.get('chat') as FormControl; }
  get badgesControl() { return this.form.get('badges') as FormControl; }
  get narrationControl() { return this.form.get('narration') as FormControl; }

  checkDates(): boolean {
    const tournament = this.form.get('tournamentDate')?.value;
    const registration = this.form.get('registrationsDate')?.value;
    if (!tournament || !registration) return false;
    const t = new Date(tournament);
    const r = new Date(registration);
    return r > t;
  }
  jogos:any[] = []

  private buscarJogos(){
    this.jogoService.getJogos().subscribe({
      next:(res)=>{
        this.jogos = res;
        console.log(this.jogos)
      }
    })
  }

  blockNumbers(event: KeyboardEvent) {
  if (/[0-9]/.test(event.key)) {
    event.preventDefault();
  }
}

cancel() {
  this.form.reset();
  this.router.navigate(['/tournaments']);
}
}
