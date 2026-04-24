import { Component, OnInit } from '@angular/core';
import { Navigation } from '../../components/navigation/navigation';
import { ButtonComponent } from '../../components/button/button';
import { Router, RouterLink } from '@angular/router';
import { Equipe, EquipeService } from '../../services/equipe-service';
import { map, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-list-group',
  imports: [Navigation, ButtonComponent, AsyncPipe],
  templateUrl: './list-group.html',
  styleUrl: './list-group.scss',
})
export class ListGroup implements OnInit {
  // Apenas exponha os observables do serviço
  minhasEquipes$: Observable<Equipe[]>;
  outrasEquipes$: Observable<Equipe[]>;

  constructor(
    private router: Router,
    private equipeService: EquipeService,
  ) {
    this.minhasEquipes$ = this.equipeService.minhasEquipes$;
    this.outrasEquipes$ = this.equipeService.outrasEquipes$;
  }

  ngOnInit() {
    this.equipeService.carregarEquipes();
  }

  irCriarEquipe() {
    this.router.navigate(['/groups/create']);
  }

  excluirEquipe(id: string) {
    const confirmacao = confirm('Tem certeza que deseja excluir esta equipe?');

    if (confirmacao) {
      console.log('Excluindo equipe:', id);
    }
  }

  enviarConvite() {
    console.log('Estou enviando o convite simulação...');
  }

  irParaEdicao(id: string) {
    this.router.navigate(['/groups/update', id]);
    console.log('TESTE');
  }
}
