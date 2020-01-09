import { Injectable, Injector } from '@angular/core';
import { HttpClient,HttpHeaders, HttpEventType, HttpParams, } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Addresses } from '@app/_models/Addresses';
import { environment } from '@app/_services/environment';
@Injectable({
  providedIn: 'root'
})
export class AddressesService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };
  apiUrl : string = environment.apiUrl;
  constructor(private http : HttpClient) { }

  public AddToAddresses(info:any):Observable<Addresses>{
    var url = this.apiUrl + '/addresses';
    return this.http.post(url,info, this.httpOptions)
    .pipe(map((res:Addresses) => {return res}));
  }
  
  public getAddressesById(id:number):Observable<Addresses>{
    var url = this.apiUrl + '/addresses/' + id ;
    return this.http.get(url)
    .pipe(map((res:Addresses) => {return res}));
  }

  public getAddresses():Observable<Addresses[]>{
    var url = this.apiUrl + '/addresses' ;
    return this.http.get(url)
    .pipe(map((res:Addresses[]) => {return res}));
  }

  public getAddressesByCustomerId(id:number):Observable<Addresses[]>{
    var url = this.apiUrl + '/addresses' ;
    var newOption = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'filter': "{\"where\":{\"customer_id\":\"" + id + "\"}}"
      })
    };
    return this.http.get(url,  newOption)
    .pipe(map((res:Addresses[]) => {return res}));
  }

  public deleteAddresses(id:number){
    var url = this.apiUrl + '/addresses/' + id;
    return this.http.patch(url,{id : id, deleted : 1}, this.httpOptions)
    .pipe(map((res:any) => {return res}));

    // var url = this.apiUrl + '/addresses/' + id ;
    // return this.http.delete(url)
    // .pipe(map((res:any) => {return res}));
  }


}
