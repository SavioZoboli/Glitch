import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemNotificationQueue } from './system-notification-queue';

describe('SystemNotificationQueue', () => {
  let component: SystemNotificationQueue;
  let fixture: ComponentFixture<SystemNotificationQueue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemNotificationQueue]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemNotificationQueue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
