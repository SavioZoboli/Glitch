import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class TournamentService {
    private storageKey = 'tournaments';

    getTournaments(): Observable<any> {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
        return this.http.get('http://localhost:3000/api/torneio/torneios',{headers})
    }

    constructor(private http: HttpClient) { }


    addTournament(t: any): Observable<any> {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
        return this.http.post('http://localhost:3000/api/torneio/adicionar', t, { headers })
    }

    removeTorneio(id:string):Observable<any>{
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
        return this.http.delete(`http://localhost:3000/api/torneio/remove/${id}`, { headers })
    }

    clearTournaments(): void {
        localStorage.removeItem(this.storageKey);
    }
}