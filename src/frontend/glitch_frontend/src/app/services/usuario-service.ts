import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  
  
  constructor(private httpClient:HttpClient){}

  public getMeusDados():Observable<any>{
    let headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
    return this.httpClient.get(`http://localhost:3000/api/usuario/eu`,{headers:headers})
  }

}
