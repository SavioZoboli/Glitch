import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon'
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario-service';

type MenuItemType = {
  name:string;
  icon:string;
  route:string;
  is_active?:boolean;
}

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

  navigation:MenuItemType[] = [
    {name:'Dashboard',icon:'dashboard',route:'/dashboard'},
    {name:'Torneios',icon:'trophy',route:'/tournaments'},
    {name:'Jogadores',icon:'person',route:'/players'},
    {name:'Equipes',icon:'people',route:'/groups'}
  ]

  constructor(private router:Router){
    let dados = localStorage.getItem('userData')
    if(dados){
      this.nickname = JSON.parse(dados).nickname
    }

    this.defineActivatedRoute();
  }

  defineActivatedRoute(){
    this.navigation.forEach(n=>{
      n.is_active = this.isThisRouteActive(n.route)
    })
  }

  isThisRouteActive(r:string):boolean{
    return r == this.router.url;
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
