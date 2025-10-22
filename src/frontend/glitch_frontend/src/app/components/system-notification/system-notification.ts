import { Component, Input } from '@angular/core';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-system-notification',
  imports: [MatIcon],
  templateUrl: './system-notification.html',
  styleUrl: './system-notification.scss'
})
export class SystemNotificationComponent {

  @Input() tipo!:'sucesso'|'erro'|'info'|'aviso'
  @Input() mensagem!:string

}
