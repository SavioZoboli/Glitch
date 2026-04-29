import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { InputComponent } from '../input/input';
import { ButtonComponent } from '../button/button';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModalService, TModal } from '../../services/misc/modal.service';

@Component({
  selector: 'app-modal',
  imports: [InputComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  title!: string;
  form!: FormGroup;
  modal!: TModal;

  estado: 'aberto' | 'fechado' = 'fechado';

  constructor(
    private modalService: ModalService,
    private cdr: ChangeDetectorRef,
  ) {
    this.modalService.modal$.subscribe((val) => {
      switch (val.acao) {
        case 'abrir':
          if(!val.modal) return;
          this.form = this.generateFormGroup(val.modal);
          this.modal = val.modal;
          this.title = val.modal.title;
          this.estado = 'aberto';
          console.log('Mudou para aberto');
          this.cdr.detectChanges()
          break;
        case 'fechar':
          console.log('tentando fechar')
          this.estado = 'fechado';
          this.cdr.detectChanges();
          break;
      }
    });
  }

  private generateFormGroup(modalData: TModal): FormGroup {
    const group: any = {};
    modalData.form.row.forEach((row) => {
      row.input.forEach((input) => {
        // Usa a instância de control que você já criou no helper
        group[input.key] = input.control;
      });
    });
    console.log('Gerou o form Group');
    return new FormGroup(group);
  }

  fechar() {
    this.modalService.fecharModal();
  }

  salvar() {
    if (this.form.valid) {
      this.modalService.confirmar(this.form.value); // Envia os dados para o Subscription.ts
      this.modalService.fecharModal();
    }
  }
}
