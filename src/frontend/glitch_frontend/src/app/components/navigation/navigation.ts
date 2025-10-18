import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon'
import { Router, RouterLink } from '@angular/router';

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

  constructor(private router:Router){

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
