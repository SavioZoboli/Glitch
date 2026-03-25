import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { InputComponent } from '../../components/input/input';
import { CompetitorLevelComponent } from '../../components/toggle-group/toggle-group';
import { ButtonComponent } from '../../components/button/button';
import { ThemeToggler } from '../../components/theme-toggler/theme-toggler';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentService } from '../../services/tournament-service';
import { UsuarioService } from '../../services/usuario-service';
import { Navigation } from '../../components/navigation/navigation';
import { DatePipe } from '@angular/common';
import { JogoService } from '../../services/jogo-service';
import { ToggleButtonComponent } from '../../components/toggle-button/toggle.button';

@Component({
  selector: 'app-update-tournament',
  imports: [
    ReactiveFormsModule,
    InputComponent,
    CompetitorLevelComponent,
    ButtonComponent,
    ThemeToggler,
    Navigation,
    ToggleButtonComponent,
  ],
  providers: [DatePipe],
  templateUrl: './update-tournament.html',
  styleUrl: './update-tournament.scss',
})
export class UpdateTournament {
  private id: string = '';
  jogos: any[] = [];
  constructor(
    private sysNotifService: SystemNotificationService,
    private router: Router,
    private tournamentService: TournamentService,
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private jogoService: JogoService,
  ) {
    this.id = this.route.snapshot.paramMap.get('id') || '';
  }

  //Função de validação para número mínimo e máximo de participantes
  participantsValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const min = group.get('minParticipants')?.value;
      const max = group.get('maxParticipants')?.value;

      if (!max) return null;

      const maxNum = Number(max);
      const minNum = Number(min);

      // max deve ser maior que 0
      if (maxNum <= 0) {
        group.get('maxParticipants')?.setErrors({ maxInvalid: true });
        return null;
      }

      // se tem mínimo, max não pode ser menor
      if (min && maxNum < minNum) {
        group.get('maxParticipants')?.setErrors({ maxLessThanMin: true });
        return null;
      }

      return null;
    };
  }

  cancel() {
    this.form.reset();
    this.router.navigate(['/tournaments']);
  }

  private buscarJogos() {
    this.jogoService.getJogos().subscribe({
      next: (res) => {
        this.jogos = res;
      },
    });
  }

  updateAddressValidators(tipoLocal: string) {
    const isPresencial = tipoLocal === 'Presencial';

    const addressControls = [
      this.addressTournamentControl,
      this.addressNumberTournamentControl,
      this.neighborhoodTournamentControl,
      this.cityTournamentControl,
      this.stateTournamentControl,
    ];

    addressControls.forEach((control) => {
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
      this.entryOnlyGroupsControl,
    ];

    groupControls.forEach((control) => {
      if (isGrupo) {
        control.setValidators([Validators.required]);
      } else {
        control.setValidators([]);
      }
      control.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.buscarJogos();
    this.buscarDadosTorneio();

    this.typePlaceTournamentControl.valueChanges.subscribe((value) => {
      this.updateAddressValidators(value);
    });

    this.typeGroupControl.valueChanges.subscribe((value) => {
      this.updateGroupValidators(value);
    });
  }

  buscarDadosTorneio() {
    this.tournamentService.getTorneioById(this.id).subscribe({
      next: (res) => {
        console.log(res);
        this.tournamentNameControl.setValue(res.nome);
        this.gameNameControl.setValue(res.jogo.nome);
        this.tournamentDateControl.setValue(
          this.datePipe.transform(res.dt_inicio, 'yyyy-MM-dd'),
        );
        this.descriptionControl.setValue(res.descricao);
        this.maxParticipantsControl.setValue(
          res.configuracao_inscricao.qtd_participantes_max,
        );
        this.registrationsDateControl.setValue(
          this.datePipe.transform(
            res.configuracao_inscricao.dt_fim,
            'yyyy-MM-dd',
          ),
        );
        this.typeGroupControl.setValue(
          res.configuracao_inscricao.modo_inscricao,
        );
        this.trophyTournamentControl.setValue(res.premiacao);
        this.typePlaceTournamentControl.setValue(res.tipo_local);
        this.paidTicketControl.setValue(res.pago);
        this.collectPlatformControl.setValue(res.transmissao?.coleta || '');
        this.streamPlatformControl.setValue(res.transmissao?.streaming || '');
        this.chatControl.setValue(res.transmissao?.chat);
        this.badgesControl.setValue(res.transmissao?.badges);
        this.narrationControl.setValue(res.transmissao?.narracao);

        this.ticketTournamentControl.setValue(res.valor_ingresso);

        this.addressTournamentControl.setValue(res.endereco?.rua || '');
        this.addressNumberTournamentControl.setValue(
          res.endereco?.numero || '',
        );
        this.neighborhoodTournamentControl.setValue(res.endereco?.bairro || '');
        this.cityTournamentControl.setValue(res.endereco?.cidade || '');
        this.stateTournamentControl.setValue(res.endereco?.estado || '');
        this.cepTournamentControl.setValue(res.endereco?.cep || '');
        this.updateAddressValidators(this.typePlaceTournamentControl.value);
        this.updateGroupValidators(this.typeGroupControl.value);
        this.competitorLevelControl.setValue(res.competitor_level);
        this.typeCompetitionControl.setValue(res.tipo_competicao);
        this.typeRankingLevelControl.setValue(res.tipo_ranking);
      },
      error: (err) => {
        this.sysNotifService.notificar('erro', 'Erro ao buscar dados');
      },
    });
  }

  submit() {
    if (this.form.valid) {
      const dados = {
        id: this.id,
        nome: this.tournamentNameControl.value,
        descricao: this.descriptionControl.value,
        dt_inicio: this.tournamentDateControl.value,
        usuario_responsavel: this.usuarioService.getUsuarioLogado()?.nickname,
        jogo_id: this.gameNameControl.value,
        endereco: {
          cep: this.cepTournamentControl.value,
          rua: this.addressTournamentControl.value,
          numero: this.addressNumberTournamentControl.value,
          bairro: this.neighborhoodTournamentControl.value,
          cidade: this.cityTournamentControl.value,
          estado: this.stateTournamentControl.value,
        },
        inscricao: {
          dt_fim: this.registrationsDateControl.value,
          modo_inscricao: this.typeGroupControl.value,
          max_participantes: this.maxParticipantsControl.value,
        },
        pagamento: {
          valor_ingresso: this.ticketTournamentControl.value,
          valor_premiacao: this.trophyTournamentControl.value,
          pago: this.paidTicketControl.value,
        },

        transmissao: {
          coleta: this.collectPlatformControl.value,
          streaming: this.streamPlatformControl.value,
          chat: this.chatControl.value,
          badges: this.badgesControl.value,
          narracao: this.narrationControl.value,
        },
      };

      console.log('Dados do torneio:', dados);

      this.tournamentService.updateTournament(dados).subscribe({
        next: (res) => {
          this.sysNotifService.notificar(
            'sucesso',
            'Alteração salva com sucesso!',
          );
          this.sysNotifService.notificar(
            'info',
            'Seu torneio foi salvo e está pronto para ser gerenciado.',
          );
          this.form.reset();
          this.router.navigate(['/tournaments']);
        },
        error: (error) => {
          console.error(error);
          this.sysNotifService.notificar('erro', 'Erro ao editar torneio');
        },
      });
    } else {
      console.log('Formulário inválido. Campos com erro:');
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.log(`Campo inválido: ${key}`, control.errors);
        }
      });

      this.form.markAllAsTouched();
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        this.sysNotifService.notificar(
          'erro',
          'Preencha corretamente todos os campos obrigatórios antes de continuar.',
        );
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
      return registrationsDate > tournamentDate
        ? { registrationAfterTournament: true }
        : null;
    };
  }

  form = new FormGroup(
    {
      tournamentName: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ]),
      gameName: new FormControl('', [Validators.required]),
      tournamentDate: new FormControl('', [
        Validators.required,
        this.dateNotPastValidator(),
      ]),

      description: new FormControl(''),

      registrationsDate: new FormControl('', [
        Validators.required,
        this.dateNotPastValidator(),
      ]),

      competitorLevel: new FormControl(''),
      typeCompetition: new FormControl(''),
      typeRanking: new FormControl(''),
      typePlaceTournament: new FormControl(''),

      addressTournament: new FormControl(''),
      addressNumberTournament: new FormControl(''),
      neighborhoodTournament: new FormControl(''),
      cityTournament: new FormControl(''),
      stateTournament: new FormControl(''),

      cepTournament: new FormControl('', [Validators.pattern(/^\d{8}$/)]),
      minParticipants: new FormControl('', [Validators.pattern(/^[0-9]+$/)]),
      trophyTournament: new FormControl(''),
      paidTicket: new FormControl(false),

      collectPlatform: new FormControl(''),
      streamPlatform: new FormControl(''),

      chat: new FormControl(false),
      badges: new FormControl(false),
      narration: new FormControl(false),
      maxParticipants: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[0-9]+$/),
      ]),

      registrationAvailable: new FormControl(true),

      typeGroup: new FormControl('', [Validators.required]),
      quantityGroups: new FormControl('', [Validators.pattern(/^[0-9]+$/)]),

      randomizeGroups: new FormControl(false),
      entryOnlyGroups: new FormControl(false),

      ticketTournament: new FormControl('', [Validators.pattern(/^[0-9]+$/)]),
    },
    {
      validators: [
        this.registrationBeforeTournamentValidator(),
        this.participantsValidator(),
      ],
    },
  );

  get tournamentNameControl() {
    return this.form.get('tournamentName') as FormControl;
  }
  get gameNameControl() {
    return this.form.get('gameName') as FormControl;
  }
  get tournamentDateControl() {
    return this.form.get('tournamentDate') as FormControl;
  }
  get descriptionControl() {
    return this.form.get('description') as FormControl;
  }
  get minParticipantsControl() {
    return this.form.get('minParticipants') as FormControl;
  }
  get maxParticipantsControl() {
    return this.form.get('maxParticipants') as FormControl;
  }
  get registrationsDateControl() {
    return this.form.get('registrationsDate') as FormControl;
  }
  get typeGroupControl() {
    return this.form.get('typeGroup') as FormControl;
  }

  get trophyTournamentControl() {
    return this.form.get('trophyTournament') as FormControl;
  }

  get paidTicketControl() {
    return this.form.get('paidTicket') as FormControl;
  }

  get collectPlatformControl() {
    return this.form.get('collectPlatform') as FormControl;
  }

  get streamPlatformControl() {
    return this.form.get('streamPlatform') as FormControl;
  }

  get chatControl() {
    return this.form.get('chat') as FormControl;
  }

  get badgesControl() {
    return this.form.get('badges') as FormControl;
  }

  get narrationControl() {
    return this.form.get('narration') as FormControl;
  }

  get ticketTournamentControl() {
    return this.form.get('ticketTournament') as FormControl;
  }

  get cepTournamentControl() {
    return this.form.get('cepTournament') as FormControl;
  }

  get addressTournamentControl() {
    return this.form.get('addressTournament') as FormControl;
  }

  get addressNumberTournamentControl() {
    return this.form.get('addressNumberTournament') as FormControl;
  }

  get neighborhoodTournamentControl() {
    return this.form.get('neighborhoodTournament') as FormControl;
  }

  get cityTournamentControl() {
    return this.form.get('cityTournament') as FormControl;
  }

  get stateTournamentControl() {
    return this.form.get('stateTournament') as FormControl;
  }
  get entryOnlyGroupsControl() {
    return this.form.get('entryOnlyGroups') as FormControl;
  }
  get randomizeGroupsControl() {
    return this.form.get('randomizeGroups') as FormControl;
  }
  get typePlaceTournamentControl() {
    return this.form.get('typePlaceTournament') as FormControl;
  }
  get quantityGroupsControl() {
    return this.form.get('quantityGroups') as FormControl;
  }

  get competitorLevelControl() {
    return this.form.get('competitorLevel') as FormControl;
  }

  get typeRankingLevelControl() {
    return this.form.get('typeRanking') as FormControl;
  }

  get typeCompetitionControl() {
    return this.form.get('typeCompetition') as FormControl;
  }

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
