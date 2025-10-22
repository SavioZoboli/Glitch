import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemNotification } from './system-notification';

describe('SystemNotification', () => {
  let component: SystemNotification;
  let fixture: ComponentFixture<SystemNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemNotification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemNotification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
