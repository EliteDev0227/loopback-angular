import { Injectable, Injector } from '@angular/core';
import { HttpClient,HttpHeaders, HttpEventType, } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Queues } from '@app/_models/Queues';
import { environment } from '@app/_services/environment';
import { Orders } from '@app/_models/orders';
@Injectable({
  providedIn: 'root'
})
export class QueuesService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };
  apiUrl : string = environment.apiUrl;
  constructor(private http : HttpClient) { }

  public executeQueue(id : number, driver_id : number, orders : Orders[], ignore: any):any{
    var url = this.apiUrl + '/Queues/execute';
    return this.http.post(url,{
      id : id,
      driver_id : driver_id,
      orders : orders,
      ignore_early : ignore
    }, this.httpOptions)
    .pipe(map((res:any) => {return res}));
  }

  public stopQueue(id : number):any{
    var url = this.apiUrl + '/Queues/stop';
    return this.http.post(url,{
      id : id
    }, this.httpOptions)
    .pipe(map((res:any) => {return res}));
  }

  public AddToQueues(info:any):Observable<Queues>{
    if (!info.id) {
      var url = this.apiUrl + '/Queues';
      return this.http.post(url,info, this.httpOptions)
      .pipe(map((res:Queues) => {return res}));
    }
    else {
      var url = this.apiUrl + '/Queues/' + info.id;
      return this.http.patch(url,info, this.httpOptions)
      .pipe(map((res:Queues) => {return res}));  
    }
  }
  
  public getQueuesById(id:number):Observable<Queues>{
    var url = this.apiUrl + '/Queues/' + id ;
    return this.http.get(url)
    .pipe(map((res:Queues) => {return res}));
  }

  public getQueues():Observable<Queues[]>{
    var url = this.apiUrl + '/Queues' ;
    return this.http.get(url)
    .pipe(map((res:Queues[]) => {return res}));
  }

  public getQueueDates():Observable<any>{
    var url = this.apiUrl + '/Queues/getDates' ;
    return this.http.get(url)
    .pipe(map((res:Queues[]) => {return res}));
  }

  public getRunningQueues():Observable<Queues[]>{
    var url = this.apiUrl + '/Queues' ;
    var newOption = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'filter': "{\"where\":{\"status\":{\"inq\":[\"2\",\"3\"]}}}"
      })
    };
    return this.http.get(url, newOption)
    .pipe(map((res:Queues[]) => {return res}));
  }

  public getStoppedQueues():Observable<Queues[]>{
    var url = this.apiUrl + '/Queues' ;
    var newOption = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'filter': "{\"where\":{\"status\":\"1\"}}"
      })
    };
    return this.http.get(url, newOption)
    .pipe(map((res:Queues[]) => {return res}));
  }

  // public getRunningQueues(date : any):Observable<Queues[]>{
  //   var url = this.apiUrl + '/Queues' ;
  //   var newOption = {
  //     headers: new HttpHeaders({
  //       'Content-Type':  'application/json',
  //       'filter': "{\"where\":{\"status\":{\"inq\":[\"2\",\"3\"]}, \"queue_date\":\"" + date + "\"}}"
  //     })
  //   };
  //   return this.http.get(url, newOption)
  //   .pipe(map((res:Queues[]) => {return res}));
  // }

  // public getStoppedQueues(date : any):Observable<Queues[]>{
  //   var url = this.apiUrl + '/Queues' ;
  //   var newOption = {
  //     headers: new HttpHeaders({
  //       'Content-Type':  'application/json',
  //       'filter': "{\"where\":{\"status\":\"1\", \"queue_date\":\"" + date + "\"}}"
  //     })
  //   };
  //   return this.http.get(url, newOption)
  //   .pipe(map((res:Queues[]) => {return res}));
  // }

  public deleteQueues(id:number){
    var url = this.apiUrl + '/Queues/' + id;
    return this.http.patch(url,{id : id, deleted : 1}, this.httpOptions)
    .pipe(map((res:any) => {return res}));
    // var url = this.apiUrl + '/Queues/' + id ;
    // return this.http.delete(url)
    // .pipe(map((res:any) => {return res}));
  }


}
