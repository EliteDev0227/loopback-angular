import { Injectable, Injector } from '@angular/core';
import { HttpClient,HttpHeaders, HttpEventType, } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Wallets } from '@app/_models/Wallets';
import { environment } from '@app/_services/environment';
@Injectable({
  providedIn: 'root'
})
export class WalletsService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };
  apiUrl : string = environment.apiUrl;
  constructor(private http : HttpClient) { }
  public AddToWallets(info:any):Observable<Wallets>{
    var url = this.apiUrl + '/Wallets';
    return this.http.post(url,info, this.httpOptions)
    .pipe(map((res:Wallets) => {return res}));
  }
  
  public getWalletsById(id:number):Observable<Wallets>{
    var url = this.apiUrl + '/Wallets/' + id ;
    return this.http.get(url)
    .pipe(map((res:Wallets) => {return res}));
  }

  public getWallets():Observable<Wallets[]>{
    var url = this.apiUrl + '/Wallets' ;
    return this.http.get(url)
    .pipe(map((res:Wallets[]) => {return res}));
  }

  public getWalletsByDriver(id:number, mode:number, start_date, end_date):Observable<Wallets[]>{
    start_date.setHours(0);
    start_date.setMinutes(0);
    start_date.setSeconds(0);
    end_date.setHours(23);
    end_date.setMinutes(59);
    end_date.setSeconds(59);

    var url = this.apiUrl + '/Wallets' ;
    var newOption = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'filter': "{\"where\":{\"driver_id\":\"" + id + "\", \"type\":\"" + mode + "\", \"and\":[{\"date\":{\"gt\":\"" + start_date + "\"}}, {\"date\":{\"lt\":\"" + end_date + "\"}}]}}"
      })
    };
    return this.http.get(url,  newOption)
    .pipe(map((res:Wallets[]) => {return res}));
  }

  public deleteWallets(id:number){
    var url = this.apiUrl + '/Wallets/' + id ;
    return this.http.delete(url)
    .pipe(map((res:any) => {return res}));
  }


}
