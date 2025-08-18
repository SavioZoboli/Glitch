import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeToggler } from './theme-toggler';

describe('ThemeToggler', () => {
  let component: ThemeToggler;
  let fixture: ComponentFixture<ThemeToggler>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ThemeToggler]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThemeToggler);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
