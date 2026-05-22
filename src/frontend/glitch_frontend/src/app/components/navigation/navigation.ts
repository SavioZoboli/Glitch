import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {MatIconModule} from '@angular/material/icon'
import { Router, RouterLink } from '@angular/router';

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
export class Navigation implements OnInit, OnDestroy {

  state:'aberto'|'fechado' = 'fechado';
  nickname:string = ''

  navigation:MenuItemType[] = [
    {name:'Dashboard',icon:'dashboard',route:'/dashboard'},
    {name:'Torneios',icon:'trophy',route:'/tournaments'},
    {name:'Jogadores',icon:'person',route:'/players'},
    {name:'Equipes',icon:'people',route:'/groups'},
    {name:'Espectador',icon:'visibility',route:'/spectator'}
  ]

  constructor(private router:Router){
    let dados = localStorage.getItem('userData')
    if(dados){
      this.nickname = JSON.parse(dados).nickname
    }

    this.defineActivatedRoute();
  }

  ngOnInit(): void {
    this.syncNavigationStateClass();
  }

  ngOnDestroy(): void {
    document.body.classList.remove('nav-open', 'nav-closed');
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
    this.syncNavigationStateClass();
  }

  isAberto():boolean{
    return this.state == 'aberto'
  }

  logoff(){
    localStorage.removeItem('token')
    this.router.navigate(['/login'])
  }

  private syncNavigationStateClass(): void {
    document.body.classList.remove('nav-open', 'nav-closed');
    document.body.classList.add(this.state === 'aberto' ? 'nav-open' : 'nav-closed');
  }

}
