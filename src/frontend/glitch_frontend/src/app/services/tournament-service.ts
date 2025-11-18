import { Injectable } from '@angular/core';

export interface Tournament {
    nome_torneio?: string;
    jogo?: string;
    data_realizacao?: string;
    data_inscricao?: string;
    nivel_competidor?: string;
    tipo_competicao?: string;
    tipo_ranking?: string;
    tipo_local?: string;
    endereco?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    participantes_min?: string;
    participantes_max?: string;
    grupos?: string;
    ingresso?: string;
    criador: string;
}


@Injectable({
    providedIn: 'root'
})
export class TournamentService {
    private storageKey = 'tournaments';

    getTournaments(): Tournament[] {
        const data = localStorage.getItem(this.storageKey);
        try {
            return data ? JSON.parse(data) as Tournament[] : [];
        } catch {
            return [];
        }
    }


    addTournament(t: Tournament): void {
        const tournaments = this.getTournaments();
        tournaments.push(t);
        localStorage.setItem(this.storageKey, JSON.stringify(tournaments));
    }

    saveTournaments(tournaments: Tournament[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(tournaments));
    }

    deleteTournament(tournament: Tournament): void {
        const tournaments = this.getTournaments().filter(t => t.nome_torneio !== tournament.nome_torneio);
        this.saveTournaments(tournaments);
    }

    clearTournaments(): void {
        localStorage.removeItem(this.storageKey);
    }
}