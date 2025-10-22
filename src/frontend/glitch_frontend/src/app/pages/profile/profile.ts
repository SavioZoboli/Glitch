import { Component } from '@angular/core';
import { Navigation } from "../../components/navigation/navigation";
import { ButtonComponent } from "../../components/button/button";
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario-service';
import { SystemNotificationService } from '../../services/misc/system-notification-service';

@Component({
  selector: 'app-profile',
  imports: [Navigation, ButtonComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent {

  user_id:string = ''
  nickname:string = ''

  constructor(private router:Router, private usuarioService:UsuarioService,private sysNotifService:SystemNotificationService){
    let dados = localStorage.getItem('userData')
    if(dados){
      this.nickname = JSON.parse(dados).nickname
      this.user_id = JSON.parse(dados).id
    }
  }

  editProfile(){
    this.router.navigate([`/update-account/${this.user_id}`])
  }

  deleteProfile(){
    const confirmar = window.confirm('Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.')
    
    if(confirmar){
      this.usuarioService.deleteUsuario(this.user_id).subscribe({
        next: () => {
          this.sysNotifService.notificar('sucesso','Removido com sucesso, deslogando...')
          localStorage.clear()
          this.router.navigate(['/']) 
        },
        error: (erro: any) => {
          console.error('Erro ao excluir usuário:', erro)
          this.sysNotifService.notificar('erro','Não foi possível excluir a conta')
        }
      })
    }
    
  }
}
