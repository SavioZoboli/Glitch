import { Component, OnInit } from '@angular/core';
import { Navigation } from '../../components/navigation/navigation';
import { ButtonComponent } from '../../components/button/button';
import { Router } from '@angular/router';
import { Equipe, EquipeService } from '../../services/equipe-service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { SystemNotificationService } from '../../services/misc/system-notification-service'; // Import para dar feedback

@Component({
  selector: 'app-list-group',
  standalone: true,
  imports: [Navigation, ButtonComponent, AsyncPipe],
  templateUrl: './list-group.html',
  styleUrl: './list-group.scss',
})
export class ListGroup implements OnInit {
  minhasEquipes$: Observable<Equipe[]>;
  outrasEquipes$: Observable<Equipe[]>;

  constructor(
    private router: Router,
    private equipeService: EquipeService,
    private notifService: SystemNotificationService // Adicionado para avisar se deu certo
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
      // CHAMA O SERVIÇO DE VERDADE AGORA:
      this.equipeService.deleteEquipe(id).subscribe({
        next: () => {
          this.notifService.notificar('sucesso', 'Equipe excluída com sucesso!');
          this.equipeService.carregarEquipes(); // Atualiza a lista na tela na hora
        },
        error: (err) => {
          console.error(err);
          this.notifService.notificar('erro', 'Erro ao excluir a equipe.');
        }
      });
    }
  }

  enviarConvite() {
    console.log('Enviando convite...');
  }

  irParaEdicao(id: string) {
    this.router.navigate(['/groups/update', id]);
  }
}