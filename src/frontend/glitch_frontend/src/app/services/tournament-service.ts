import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class TournamentService {
    private storageKey = 'tournaments';

    getTournaments(): any[] {
        const data = localStorage.getItem(this.storageKey);
        try {
            return data ? JSON.parse(data) as any[] : [];
        } catch {
            return [];
        }
    }

    constructor(private http: HttpClient) { }


    addTournament(t: any): Observable<any> {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
        return this.http.post('http://localhost:3000/api/torneio/adicionar', t, { headers })
    }

    clearTournaments(): void {
        localStorage.removeItem(this.storageKey);
    }
}