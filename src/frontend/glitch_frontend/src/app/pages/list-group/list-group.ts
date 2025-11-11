import { Component, OnInit } from '@angular/core';
import { Navigation } from "../../components/navigation/navigation";
import { ButtonComponent } from "../../components/button/button";
import { Router } from '@angular/router';
import { Equipe, EquipeService } from '../../services/equipe-service';
import { map, Observable, Subject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-list-group',
  imports: [Navigation, ButtonComponent,AsyncPipe],
  templateUrl: './list-group.html',
  styleUrl: './list-group.scss'
})
export class ListGroup implements OnInit{


 // Apenas exponha os observables do serviço
  minhasEquipes$: Observable<Equipe[]>;
  outrasEquipes$: Observable<Equipe[]>;

  constructor(private router:Router,private equipeService:EquipeService){
    this.minhasEquipes$ = this.equipeService.minhasEquipes$;
    this.outrasEquipes$ = this.equipeService.outrasEquipes$;
  }

  ngOnInit(){
this.equipeService.carregarEquipes();
  }


  irCriarEquipe(){
    this.router.navigate(['/create-group'])
  }



}
