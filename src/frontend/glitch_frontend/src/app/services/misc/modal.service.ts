import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export type ModalAcao = {
  acao: 'abrir' | 'fechar';
  modal?: TModal;
};

export type TModal = {
  title: string;
  form: ModalForm;
};

export type ModalForm = {
  row: FormRow[];
};

export type FormRow = {
  key: number;
  input: FormInput[];
};

export type FormInput = {
  key: string;
  label: string;
  placeholder: string;
  control: FormControl;
  type: string;
  valueList: any[];
};

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalSubject = new Subject<ModalAcao>();
  public modal$: Observable<ModalAcao> = this.modalSubject.asObservable();

  private confirmacaoSubject = new Subject<any>();
  public confirmacao$:Observable<any> = this.confirmacaoSubject.asObservable();



  public abrirModal(modal:TModal) {
    this.modalSubject.next({
      acao: 'abrir',
      modal: modal,
    });
  }

  public fecharModal() {
    this.modalSubject.next({ acao: 'fechar' });
  }

  public confirmar(dados: any) {
  this.confirmacaoSubject.next(dados);
}
}
