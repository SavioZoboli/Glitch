import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TournamentDetails } from './tournament-details';

describe('TournamentDetails', () => {
  let component: TournamentDetails;
  let fixture: ComponentFixture<TournamentDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

