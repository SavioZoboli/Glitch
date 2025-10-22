import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export type SystemNotification = {
  id:number;  
  tipo:'sucesso'|'erro'|'info'|'aviso',
  mensagem:string,
  tempo:number
}


@Injectable({
  providedIn: 'root'
})
export class SystemNotificationService {
  
// BehaviorSubject mantém o último valor e o emite para novos inscritos.
  // Ele vai guardar nosso array de notificações. Começa com um array vazio.
  private notificationsSubject = new BehaviorSubject<SystemNotification[]>([]);
  
  // Expomos como um Observable para que ninguém de fora possa emitir valores nele.
  public notifications$: Observable<SystemNotification[]> = this.notificationsSubject.asObservable();

  private idCounter = 0;

  constructor() { }

  /**
   * Método público para disparar uma nova notificação.
   */
  public notificar(tipo: 'sucesso' | 'erro' | 'info' | 'aviso', mensagem: string, tempo: number = 1500): void {
    const novaNotificacao: SystemNotification = {
      id: this.idCounter++,
      tipo,
      mensagem,
      tempo
    };
    
    // Adiciona a nova notificação à lista
    this.addNotification(novaNotificacao);
    
    // Agenda a remoção da mesma notificação
    setTimeout(() => {
      this.removeNotification(novaNotificacao.id);
    }, tempo);
  }

  private addNotification(notification: SystemNotification): void {
    // Pega a lista atual
    const currentNotifications = this.notificationsSubject.getValue();
    // Cria uma nova lista com a nova notificação
    const updatedNotifications = [...currentNotifications, notification];
    // Emite a nova lista para todos os inscritos (via async pipe)
    this.notificationsSubject.next(updatedNotifications);
  }

  private removeNotification(id: number): void {
    const currentNotifications = this.notificationsSubject.getValue();
    const updatedNotifications = currentNotifications.filter((n:SystemNotification) => n.id !== id);
    this.notificationsSubject.next(updatedNotifications);
  }

}
