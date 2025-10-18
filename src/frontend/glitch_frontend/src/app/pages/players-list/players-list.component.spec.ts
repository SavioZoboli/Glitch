import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayersListComponent } from './players-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('PlayersListComponent', () => {
  let component: PlayersListComponent;
  let fixture: ComponentFixture<PlayersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PlayersListComponent,
        HttpClientTestingModule,
        FormsModule,
        CommonModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter players by search term', () => {
    component.jogadores = [
      { nome: 'Ana', nickname: 'Aninha', funcao: 'Suporte', rank: 'Prata' },
      { nome: 'Rodrigo', nickname: 'Driguito', funcao: 'Carry', rank: 'Ouro' }
    ];
    component.searchTerm = 'ana';
    const filtered = component.filteredPlayers();
    expect(filtered.length).toBe(1);
    expect(filtered[0].nome).toBe('Ana');
  });
});
