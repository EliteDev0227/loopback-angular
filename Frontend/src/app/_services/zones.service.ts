import { Injectable, Injector } from '@angular/core';
import { HttpClient,HttpHeaders, HttpEventType, } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Zones } from '@app/_models/zones';
import { environment } from '@app/_services/environment';
@Injectable({
  providedIn: 'root'
})
export class ZonesService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };
  apiUrl : string = environment.apiUrl;
  constructor(private http : HttpClient) { }

  public AddToZones(info:any):Observable<Zones>{
    var url = this.apiUrl + '/zones';
    return this.http.post(url,info, this.httpOptions)
    .pipe(map((res:Zones) => {return res}));
  }
  
  public SaveBikeable(info:any):Observable<Zones>{
    var url = this.apiUrl + '/zones/saveBikeable';
    return this.http.post(url,{
      data : info
    }, this.httpOptions)
    .pipe(map((res:Zones) => {return res}));
  }
  
  public getZonesById(id:number):Observable<Zones>{
    var url = this.apiUrl + '/zones/' + id ;
    return this.http.get(url)
    .pipe(map((res:Zones) => {return res}));
  }

  public getZones():Observable<Zones[]>{
    var url = this.apiUrl + '/zones' ;
    return this.http.get(url)
    .pipe(map((res:Zones[]) => {return res}));
  }

  public deleteZones(id:number){
    var url = this.apiUrl + '/zones/' + id;
    return this.http.patch(url,{id : id, deleted : 1}, this.httpOptions)
    .pipe(map((res:Zones) => {return res}));

    // var url = this.apiUrl + '/zones/' + id ;
    // return this.http.delete(url)
    // .pipe(map((res:any) => {return res}));
  }


}
