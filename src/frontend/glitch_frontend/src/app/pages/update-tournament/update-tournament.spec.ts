import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTournament } from './update-tournament';

describe('UpdateTournament', () => {
  let component: UpdateTournament;
  let fixture: ComponentFixture<UpdateTournament>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateTournament]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateTournament);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
