import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  constructor(private httpClient:HttpClient){}

  public authenticate(usuario:string,senha:string):Observable<any>{
    return this.httpClient.post('http://localhost:3000/api/usuario/authenticate',{usuario,senha})
  }
}
