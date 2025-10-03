import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Carrousel } from './carrousel';

describe('Carrousel', () => {
  let component: Carrousel;
  let fixture: ComponentFixture<Carrousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Carrousel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Carrousel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
