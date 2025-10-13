import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon'

@Component({
  selector: 'app-navigation',
  standalone:true,
  imports: [
    MatIconModule,
    CommonModule
],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss'
})
export class Navigation {

  state:'aberto'|'fechado' = 'fechado';

  toggleStatus(){
    this.state = this.state == 'aberto'?'fechado':'aberto'
  }

  isAberto():boolean{
    return this.state == 'aberto'
  }
}
