import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RankingGlobal } from './ranking-global';

describe('RankingGlobal', () => {
  let component: RankingGlobal;
  let fixture: ComponentFixture<RankingGlobal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RankingGlobal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RankingGlobal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
