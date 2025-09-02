import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../components/input/input';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.html',
  styleUrls: ['./create-account.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent
  ]
})
export class CreateAccountComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  get emailControl(): FormControl {
    return this.form.get('email') as FormControl;
  }

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
