import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  constructor(private httpClient:HttpClient){}

    private api_url:string = environment.apiURL;

  public authenticate(nickname:string,senha:string):Observable<any>{
    return this.httpClient.post(`${this.api_url}/api/usuario/login`,{nickname,senha})
  }
}
