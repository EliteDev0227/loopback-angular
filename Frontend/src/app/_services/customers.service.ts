import { Injectable, Injector } from '@angular/core';
import { HttpClient,HttpHeaders, HttpEventType, } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Customers } from '@app/_models/Customers';
import { environment } from '@app/_services/environment';
@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };
  apiUrl : string = environment.apiUrl;
  constructor(private http : HttpClient) { }

  public AddToCustomers(info:any):Observable<Customers>{
    var url = this.apiUrl + '/customers';
    return this.http.post(url,info, this.httpOptions)
    .pipe(map((res:Customers) => {return res}));
  }
  
  public getCustomersById(id:number):Observable<Customers>{
    var url = this.apiUrl + '/customers/' + id ;
    return this.http.get(url)
    .pipe(map((res:Customers) => {return res}));
  }

  public getCustomersByPhone(phone:string):Observable<Customers[]>{
    var url = this.apiUrl + '/customers' ;
    var newOption = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'filter': "{\"where\":{\"phone\":\"" + phone + "\"}}"
      })
    };
    return this.http.get(url,  newOption)
    .pipe(map((res:Customers[]) => {return res}));
  }
  public getCustomers():Observable<Customers[]>{
    var url = this.apiUrl + '/customers' ;
    return this.http.get(url)
    .pipe(map((res:Customers[]) => {return res}));
  }

  public deleteCustomers(id:number){
    var url = this.apiUrl + '/customers/' + id;
    return this.http.patch(url,{id : id, deleted : 1}, this.httpOptions)
    .pipe(map((res:any) => {return res}));

    // var url = this.apiUrl + '/customers/' + id ;
    // return this.http.delete(url)
    // .pipe(map((res:any) => {return res}));
  }


}
