import { Component } from '@angular/core';
import { Navigation } from "../../components/navigation/navigation";
import { ButtonComponent } from "../../components/button/button";
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-group',
  imports: [Navigation, ButtonComponent],
  templateUrl: './list-group.html',
  styleUrl: './list-group.scss'
})
export class ListGroup {

  constructor(private router:Router){}

  irCriarEquipe(){
    this.router.navigate(['/create-group'])
  }
}
