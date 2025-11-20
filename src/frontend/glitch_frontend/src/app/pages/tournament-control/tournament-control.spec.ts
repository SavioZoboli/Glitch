/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TournamentControl } from './tournament-control';

describe('TournamentControl', () => {
  let component: TournamentControl;
  let fixture: ComponentFixture<TournamentControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentControl],
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentControl);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark player as ready', () => {
    component.notificacoes = [];
    component.marcarPronto();
    expect(component.notificacoes.length).toBe(1);
  });

  it('should register desistir', () => {
    component.notificacoes = [];
    component.desistir();
    expect(component.notificacoes.length).toBe(1);
  });
});
