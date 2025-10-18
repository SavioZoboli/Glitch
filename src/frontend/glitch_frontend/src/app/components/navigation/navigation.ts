import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon'
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario-service';

@Component({
  selector: 'app-navigation',
  standalone:true,
  imports: [
    MatIconModule,
    CommonModule,
    RouterLink
],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss'
})
export class Navigation {

  state:'aberto'|'fechado' = 'fechado';
  nickname:string = ''

  constructor(private router:Router){
    let dados = localStorage.getItem('userData')
    if(dados){
      this.nickname = JSON.parse(dados).nickname
    }
  }

  toggleStatus(){
    this.state = this.state == 'aberto'?'fechado':'aberto'
  }

  isAberto():boolean{
    return this.state == 'aberto'
  }

  logoff(){
    localStorage.removeItem('token')
    this.router.navigate(['/login'])
  }


}
