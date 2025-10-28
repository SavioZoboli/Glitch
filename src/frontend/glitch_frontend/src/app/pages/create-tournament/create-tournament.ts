import { Component } from '@angular/core';
import { Navigation } from "../../components/navigation/navigation";
import { ButtonComponent } from "../../components/button/button";
import { InputComponent } from "../../components/input/input";
import { FormControl, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CompetitorLevelComponent } from "../../components/toggle-group/toggle-group";
import { ThemeToggler } from "../../components/theme-toggler/theme-toggler";
import { ToggleButtonComponent } from "../../components/toggle-button/toggle.button"

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
  Navigation
],
  templateUrl: './create-tournament.html',
  styleUrls: ['./create-tournament.scss']
})
export class CreateTournament {
submit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
  // Debug
  Object.keys(this.form.controls).forEach(key => {
const control = this.form.get(key);
  if (control?.invalid) {
  console.log(`Campo inválido: ${key}`, control.errors);
  }
  });
  return;
  }
  console.log('Torneio criado com sucesso', this.form.value);
}

dateNotPastValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const selectedDateStr = control.value;
    // Se a data selecionada for menor que hoje, retorna erro
    return selectedDateStr < todayStr ? { pastDate: true } : null;
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
  competitorLevel: new FormControl('', [Validators.required]),
  typeCompetition: new FormControl('', [Validators.required]),
  typeRanking: new FormControl('', [Validators.required]),
  typePlaceTournament: new FormControl('', [Validators.required]),
  addressTournament: new FormControl(''),
  addressNumberTournament: new FormControl(''),
  neighborhoodTournament: new FormControl(''),
  cityTournament: new FormControl(''),
  stateTournament: new FormControl(''),
  cepTournament: new FormControl(''),
  minParticipants: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]+$/)]),
  maxParticipants: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]+$/)]),
  registrationsDate: new FormControl('', [Validators.required, this.dateNotPastValidator()]),
  registrationAvailable: new FormControl(false),
  typeGroup: new FormControl('', [Validators.required]),
  quantityGroups: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]+$/)]),
  randomizeGroups: new FormControl(false),
  entryOnlyGroups: new FormControl(false),
  ticketTournament: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]+$/)])
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
}
