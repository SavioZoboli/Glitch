import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { InputComponent } from "../../components/input/input";
import { ButtonComponent } from "../../components/button/button";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication-service';
import { UsuarioService } from '../../services/usuario-service';

@Component({
  selector: 'app-login',
  standalone:true,
  imports: [RouterLink, MatIcon, InputComponent, ButtonComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {

  form:FormGroup = new FormGroup({
    nickname:new FormControl('',Validators.required),
    senha:new FormControl('',Validators.required)
  })

  get nicknameControl():FormControl{return this.form.get('nickname') as FormControl}
  get senhaControl():FormControl{return this.form.get('senha') as FormControl}

  constructor(private authService:AuthenticationService,private router:Router,private usuarioService:UsuarioService){}

  login(){
    if(this.form.valid){
      let dados = this.form.value
      this.authService.authenticate(dados.nickname,dados.senha).subscribe({
        next:(res)=>{
          console.log(res)
          localStorage.setItem('token',res)
          this.usuarioService.getMeusDados().subscribe({
            next:(dadosUsuario)=>{
              console.log(dadosUsuario)
              localStorage.setItem('userData',JSON.stringify(dadosUsuario))
              this.router.navigate(['/dashboard'])
            }
          })
          
        },
        error:(error)=>{
          console.error(error)
        }
      })
    }
  }

}
