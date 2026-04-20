import { Injectable } from '@angular/core';
import { TournamentService } from '../tournament-service';
import { SystemNotificationService } from '../misc/system-notification-service';
import { EquipeService } from '../equipe-service';
import {
  FormInput,
  FormRow,
  ModalForm,
  ModalService,
  TModal,
} from '../misc/modal.service';
import { FormControl, Validators } from '@angular/forms';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Subscription {
  constructor(
    private tournamentService: TournamentService,
    private notifService: SystemNotificationService,
    private equipeService: EquipeService,
    private modalService: ModalService,
  ) {}

  public subscribe(
    tournament: string,
    mode: 'individual' | 'grupo',
    group: string | null = null,
  ) {
    mode == 'individual'
      ? this.soloSubscribe(tournament)
      : this.groupSubscribe(tournament, group);
  }

  private soloSubscribe(t: string) {
    this.tournamentService.ingressarTorneio(t).subscribe({
      next: (res) => {
        this.notifService.notificar('sucesso', 'Ingressou com sucesso!');
        this.notifService.notificar(
          'info',
          'Quando chegar a data, você poderá participar do torneio.',
        );
      },
      error: (err) => {
        console.log(err);
        this.notifService.notificar('erro', 'Erro ao ingressar no torneio');
      },
    });
  }

  private groupSubscribe(t: string, g: string | null) {
    if (!g) {
      //Necessário abrir o modal
      console.log('Grupo vazio');
      this.equipeService.getMinhasEquipes().subscribe({
        next: (res) => {
          const listagemEquipes = res.map((reg: any) => ({
            codigo: reg.id,
            nome: reg.nome, // Renomeando para 'label' para facilitar no componente app-input
          }));
          console.log(res);
          // Ao montar o seu FormInput para o Modal:
          const inputGrupo: FormInput = {
            key: Math.floor(Math.random() * 1000).toString(),
            label: 'Selecione a Equipe',
            placeholder: 'Escolha um grupo...',
            type: 'select',
            control: new FormControl('', Validators.required),
            valueList: listagemEquipes, // Aqui entra o array filtrado
          };

          const row: FormRow = {
            key: Math.floor(Math.random() * 1000),
            input: [inputGrupo],
          };

          const form: ModalForm = {
            row: [row],
          };

          const tmodal: TModal = {
            title: 'Seleção de equipes',
            form: form,
          };

          this.modalService.abrirModal(tmodal);

          this.modalService.confirmacao$
            .pipe(take(1))
            .subscribe((dadosForm) => {
              console.log(dadosForm);
              const idEquipe = dadosForm[inputGrupo.key];
              this.groupSubscribe(t, idEquipe);
            });
        },
      });
      return;
    }

    this.tournamentService.ingressarTorneioEquipe(t, g).subscribe({
      next: (res) => {
        this.notifService.notificar('sucesso', 'Ingressou com sucesso!');
        this.notifService.notificar(
          'info',
          'Quando chegar a data, você poderá participar do torneio.',
        );
      },
      error: (err) => {
        console.log(err);
        this.notifService.notificar('erro', 'Erro ao ingressar no torneio');
      },
    });
  }
}
