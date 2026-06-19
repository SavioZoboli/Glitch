import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {MatIconModule} from '@angular/material/icon'
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
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
export class Navigation implements OnInit, OnDestroy {

  state:'aberto'|'fechado' = 'fechado';
  nickname:string = ''
  avatarUrl: string = '/imgs/photo-profile-default.png';
  dadosUsuarioSubscription?: Subscription;
  usuarioLocalSubscription?: Subscription;

  navigation:MenuItemType[] = [
    {name:'Dashboard',icon:'dashboard',route:'/dashboard'},
    {name:'Torneios',icon:'trophy',route:'/tournaments'},
    {name:'Minha agenda',icon:'calendar_today',route:'/schedule'},
    {name:'Espectador',icon:'live_tv',route:'/spectator'},
    {name:'Jogadores',icon:'person',route:'/players'},
    {name:'Equipes',icon:'people',route:'/groups'}
  ]

  constructor(
    private router:Router,
    private usuarioService: UsuarioService,
  ){
    this.aplicarDadosUsuario(this.usuarioService.getUsuarioLogado());

    this.defineActivatedRoute();
  }

  ngOnInit(): void {
    this.syncNavigationStateClass();
    this.usuarioLocalSubscription = this.usuarioService.usuarioLogado$.subscribe({
      next: (usuario) => {
        this.aplicarDadosUsuario(usuario);
      },
    });

    this.dadosUsuarioSubscription = this.usuarioService.getMeusDados().subscribe({
      next: (dadosUsuario) => {
        this.usuarioService.atualizarUsuarioLocal(dadosUsuario);
      },
    });
  }

  ngOnDestroy(): void {
    document.body.classList.remove('nav-open', 'nav-closed');
    this.dadosUsuarioSubscription?.unsubscribe();
    this.usuarioLocalSubscription?.unsubscribe();
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
    this.usuarioService.limparUsuarioLocal();
    this.router.navigate(['/login'])
  }

  private syncNavigationStateClass(): void {
    document.body.classList.remove('nav-open', 'nav-closed');
    document.body.classList.add(this.state === 'aberto' ? 'nav-open' : 'nav-closed');
  }

  private aplicarDadosUsuario(usuario: any): void {
    if (!usuario) {
      this.nickname = '';
      this.avatarUrl = this.usuarioService.avatarPadraoUrl;
      return;
    }

    this.nickname = String(usuario?.nickname ?? this.nickname ?? '').trim();
    this.avatarUrl = this.usuarioService.obterAvatarComFallback(
      usuario?.avatarUrl ?? usuario?.avatar_url ?? null,
    );
  }

}
