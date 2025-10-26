import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../components/input/input';
import { ButtonComponent } from "../../components/button/button";
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { UsuarioService } from '../../services/usuario-service';
import { SystemNotificationService } from '../../services/misc/system-notification-service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.html',
  styleUrls: ['./create-account.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    RouterLink,
    MatIcon
  ]
})
export class CreateAccountComponent {

  constructor(private usuarioService: UsuarioService, private sysNotifService: SystemNotificationService, private router: Router) {

  }


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
    nickname: new FormControl('', [
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
    ]),
    nationality: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(2)
    ]),
    password: new FormControl('', [
      Validators.required,
    ]),
    confirmPassword: new FormControl('', [
      Validators.required,
    ])
  });


  // 🔹 Getters para usar no template
  get firstNameControl() { return this.form.get('firstName') as FormControl; }
  get lastNameControl() { return this.form.get('lastName') as FormControl; }
  get emailControl() { return this.form.get('email') as FormControl; }
  get phoneControl() { return this.form.get('phone') as FormControl; }
  get cpfControl() { return this.form.get('cpf') as FormControl; }
  get birthdayControl() { return this.form.get('birthday') as FormControl; }
  get nationalityControl() { return this.form.get('nationality') as FormControl; }
  get nicknameControl() { return this.form.get('nickname') as FormControl; }
  get passwordControl() { return this.form.get('password') as FormControl; }
  get confirmPasswordControl() { return this.form.get('confirmPassword') as FormControl; }

  private addSubscription: Subscription | undefined

  // Método de submit
  submit() {
    if (this.form.valid) {
      if(this.passwordControl.value == this.confirmPasswordControl.value){
      const dados = {
        nome: this.firstNameControl.value,
        sobrenome: this.lastNameControl.value,
        nickname: this.nicknameControl.value,
        senha:this.passwordControl.value,
        email: this.emailControl.value,
        telefone: this.phoneControl.value,
        cpf: this.cpfControl.value.replaceAll('.','').replaceAll('-',''),
        nacionalidade: this.nationalityControl.value,
        dt_nascimento:this.geraData(this.birthdayControl.value)
      }
      console.log(dados.dt_nascimento)
      this.addSubscription = this.usuarioService.addUsuario(dados).subscribe({
        next: (res) => {
          this.sysNotifService.notificar('sucesso', 'Usuário salvo com sucesso!')
          this.sysNotifService.notificar('info', 'Faça login para entrar...')
          this.router.navigate(['/login'])

        },
        error:(err)=>{
           this.sysNotifService.notificar('erro','Erro ao adicionar.')
           console.error(err)
        }
      })
      }else{
        this.sysNotifService.notificar('erro','Senhas precisam coincidir')
      }
      
    } else {
      console.log('Formulário inválido');
      this.form.markAllAsTouched();
    }
  }

  private geraData(data:string):Date{
    let splitted:string[] = data.split('-')
    let date = new Date(Date.UTC(parseInt(splitted[0]),parseInt(splitted[1]) - 1,parseInt(splitted[2])))
    return date;
  }


}
