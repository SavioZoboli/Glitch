import { Component } from '@angular/core';
import { Navigation } from "../../components/navigation/navigation";
import { ButtonComponent } from "../../components/button/button";
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [Navigation, ButtonComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent {

  user_id:string = ''
  nickname:string = ''

  constructor(private router:Router){
    let dados = localStorage.getItem('userData')
    if(dados){
      this.nickname = JSON.parse(dados).nickname
      this.user_id = JSON.parse(dados).id
    }
  }

  editProfile(){
    this.router.navigate([`/update-account/${this.user_id}`])
  }
}
