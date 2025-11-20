/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TournamentManage } from './tournament-manage';

describe('TournamentManage', () => {
  let component: TournamentManage;
  let fixture: ComponentFixture<TournamentManage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentManage],
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentManage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should increase score of team 1', () => {
    component.pontuacaoTime1 = 1;
    component.alterarPlacar(1, 1);
    expect(component.pontuacaoTime1).toBe(2);
  });

  it('should register a death event', () => {
    component.eventos = [];
    component.registrarMorte({ id: 1, nickname: 'Teste' }, 1);
    expect(component.eventos.length).toBe(1);
    expect(component.eventos[0].texto).toContain('Teste');
  });
});
