import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamInviteBoxComponent } from './team-invite-box-component';

describe('TeamInviteBoxComponent', () => {
  let component: TeamInviteBoxComponent;
  let fixture: ComponentFixture<TeamInviteBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamInviteBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamInviteBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
