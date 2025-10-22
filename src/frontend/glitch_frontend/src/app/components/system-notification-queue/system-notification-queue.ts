import { Component, OnDestroy, OnInit } from '@angular/core';
import { SystemNotificationComponent } from "../system-notification/system-notification";
import { SystemNotification, SystemNotificationService } from '../../services/misc/system-notification-service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-system-notification-queue',
  standalone:true,
  imports: [SystemNotificationComponent,AsyncPipe],
  templateUrl: './system-notification-queue.html',
  styleUrl: './system-notification-queue.scss',
})
export class SystemNotificationQueue{
public notifications$: Observable<SystemNotification[]>;

  constructor(private notificationService: SystemNotificationService) {
    // O componente simplesmente aponta para o observable do serviço.
    this.notifications$ = this.notificationService.notifications$;
  }
}
