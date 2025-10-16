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

  constructor(private router:Router){

  }

  editProfile(){
    this.router.navigate(['update-profile'])
  }
}
