import { Component } from '@angular/core';

type Caroussel = {
  img:string;
  href:string|null;
  position:'atual'|'anterior'|'proximo'|'escondido';

}

@Component({
  selector: 'app-carrousel',
  standalone: true,
  imports:[],
  templateUrl: './carrousel.html',
  styleUrl: './carrousel.scss'
})
export class Carrousel {

carrousels:Caroussel[] = [];

constructor(){
  this.carrousels = [{
    img:'Imagem 1',
    href:null,
    position:'anterior'
  },{
    img:'Imagem 2',
    href:null,
    position:'atual'
  },{
    img:'Imagem 3',
    href:null,
    position:'proximo'
  },]
}


}
