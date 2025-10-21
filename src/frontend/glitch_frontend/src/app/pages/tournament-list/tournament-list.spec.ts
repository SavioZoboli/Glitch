import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentList } from './tournament-list';

describe('TournamentList', () => {
  let component: TournamentList;
  let fixture: ComponentFixture<TournamentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TournamentList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
