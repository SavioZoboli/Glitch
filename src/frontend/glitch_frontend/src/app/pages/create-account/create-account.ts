import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../components/input/input';
import { ButtonComponent } from "../../components/button/button";

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.html',
  styleUrls: ['./create-account.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent
]
})
export class CreateAccountComponent {
  form = new FormGroup({
  firstName: new FormControl('', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(50)
  ]),
  lastName: new FormControl('', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(50)
  ]),
  email: new FormControl('', [
    Validators.required,
    Validators.email
  ]),
  phone: new FormControl('', [
    Validators.required,
    Validators.pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/) // (99) 99999-9999 ou 9999-9999
  ]),
  cpf: new FormControl('', [
    Validators.required,
    Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/) // 000.000.000-00
  ]),
  birthday: new FormControl('', [
    Validators.required,
    Validators.pattern(/^\d{2}\/\d{2}\/\d{4}$/) //00/00/0000
  ]),
  cep: new FormControl('', [
    Validators.required,
    Validators.pattern(/^\d{5}-?\d{3}$/) // 00000-000
  ]),
  city: new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]),
  state: new FormControl('', [
    Validators.required,
    Validators.pattern(/^[A-Z]{2}$/) // SP, RJ, MG...
  ]),
  road: new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]),
  numberAdress: new FormControl('', [
    Validators.required,
    Validators.pattern(/^\d+$/) // só números
  ]),
  complement: new FormControl('') //sem validação
});


// 🔹 Getters para usar no template
  get firstNameControl() { return this.form.get('firstName') as FormControl; }
  get lastNameControl() { return this.form.get('lastName') as FormControl; }
  get emailControl() { return this.form.get('email') as FormControl; }
  get phoneControl() { return this.form.get('phone') as FormControl; }
  get cpfControl() { return this.form.get('cpf') as FormControl; }
  get birthdayControl() { return this.form.get('birthday') as FormControl; }
  get cepControl() { return this.form.get('cep') as FormControl; }
  get cityControl() { return this.form.get('city') as FormControl; }
  get stateControl() { return this.form.get('state') as FormControl; }
  get roadControl() { return this.form.get('road') as FormControl; }
  get numberAdressControl() { return this.form.get('numberAdress') as FormControl; }
  get complementControl() { return this.form.get('complement') as FormControl; }

  // Método de submit
  submit() {
    if (this.form.valid) {
      console.log('Dados do formulário:', this.form.value);
      // lógica de criação de conta aqui
    } else {
      console.log('Formulário inválido');
      this.form.markAllAsTouched();
    }
  }
}
