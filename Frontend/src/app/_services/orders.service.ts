import { Injectable, Injector } from '@angular/core';
import { HttpClient,HttpHeaders, HttpEventType, } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Orders } from '@app/_models/Orders';
import { environment } from '@app/_services/environment';
@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };
  apiUrl : string = environment.apiUrl;
  constructor(private http : HttpClient) { }

  public markArrived(id:number):Observable<any>{
    var url = this.apiUrl + '/Orders/markArrived';
    return this.http.post(url,{
      id : id
    }, this.httpOptions)
    .pipe(map((res:any) => {return res}));
  }

  public holdOrder(id:number):Observable<Orders>{
    var url = this.apiUrl + '/Orders/hold';
    return this.http.post(url,{
      id : id
    }, this.httpOptions)
    .pipe(map((res:any) => {return res}));
  }

  public cancelOrder(id:number):Observable<Orders>{
    var url = this.apiUrl + '/Orders/cancel';
    return this.http.post(url,{
      id : id
    }, this.httpOptions)
    .pipe(map((res:any) => {return res}));
  }

  public updateItems(item:number):Observable<Orders>{
    var url = this.apiUrl + '/Orders/updateItems';
    return this.http.post(url,{item:item}, this.httpOptions)
    .pipe(map((res:any) => {return res}));
  }

  public AddToOrders(info:any):Observable<Orders>{
    if (!info.id) {
      var url = this.apiUrl + '/Orders';
      return this.http.post(url,info, this.httpOptions)
      .pipe(map((res:Orders) => {return res}));
    }
    else {
      var url = this.apiUrl + '/Orders/' + info.id;
      return this.http.patch(url,info, this.httpOptions)
      .pipe(map((res:Orders) => {return res}));
    }
  }
  
  public getOrdersById(id:number):Observable<Orders>{
    var url = this.apiUrl + '/Orders/' + id ;
    return this.http.get(url)
    .pipe(map((res:Orders) => {return res}));
  }

  public getOrders():Observable<Orders[]>{
    var url = this.apiUrl + '/Orders' ;
    return this.http.get(url)
    .pipe(map((res:Orders[]) => {return res}));
  }

  public getOrdersByRange(start_date, end_date):Observable<Orders[]>{
    start_date.setHours(0);
    start_date.setMinutes(0);
    start_date.setSeconds(0);
    end_date.setHours(23);
    end_date.setMinutes(59);
    end_date.setSeconds(59);

    var url = this.apiUrl + '/Orders' ;
    var newOption = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'filter': "{\"where\":{\"and\":[{\"created_date\":{\"gt\":\"" + start_date + "\"}}, {\"created_date\":{\"lt\":\"" + end_date + "\"}}]}}"
      })
    };
    return this.http.get(url, newOption)
    .pipe(map((res:Orders[]) => {return res}));
  }

  public getDeliveredOrders(customer_id : number):Observable<Orders[]>{
    var url = this.apiUrl + '/Orders' ;
    var newOption = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'filter': "{\"where\":{\"customer_id\":\"" + customer_id + "\", \"status\":\"3\"}}"
      })
    };
    return this.http.get(url,newOption)
    .pipe(map((res:Orders[]) => {return res}));
  }

  public getUnassignedOrders():Observable<Orders[]>{
    var url = this.apiUrl + '/Orders/unassigned' ;
    return this.http.get(url)
    .pipe(map((res:any) => {return res.data}));
  }

  public getFailedOrders():Observable<Orders[]>{
    var url = this.apiUrl + '/Orders/failed' ;
    return this.http.get(url)
    .pipe(map((res:any) => {return res.data}));
  }

  public getRejectedOrders():Observable<Orders[]>{
    var url = this.apiUrl + '/Orders/rejected' ;
    return this.http.get(url)
    .pipe(map((res:any) => {return res.data}));
  }

  public deleteOrders(id:number){
    var url = this.apiUrl + '/Orders/' + id;
    return this.http.patch(url,{id : id, deleted : 1}, this.httpOptions)
    .pipe(map((res:any) => {return res}));
    // var url = this.apiUrl + '/Orders/' + id ;
    // return this.http.delete(url)
    // .pipe(map((res:any) => {return res}));
  }


}
