import { Injectable, Injector } from '@angular/core';
import { HttpClient,HttpHeaders, HttpEventType, } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Areas } from '@app/_models/Areas';
import { environment } from '@app/_services/environment';
@Injectable({
  providedIn: 'root'
})
export class AreasService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };
  apiUrl : string = environment.apiUrl;
  constructor(private http : HttpClient) { }

  public AddToAreas(info:any):Observable<Areas>{
    var url = this.apiUrl + '/areas';
    return this.http.patch(url,info,this.httpOptions)
    .pipe(map((res:Areas) => {return res}));
  }
  
  public getAreasById(id:number):Observable<Areas>{
    var url = this.apiUrl + '/areas/' + id ;
    return this.http.get(url)
    .pipe(map((res:Areas) => {return res}));
  }

  public getAreas():Observable<Areas[]>{
    var url = this.apiUrl + '/areas' ;
    return this.http.get(url)
    .pipe(map((res:Areas[]) => {return res}));
  }

  public getAreasByZoneId(zone_id : number):Observable<Areas[]>{
    var url = this.apiUrl + '/areas' ;
    var newOption = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'filter': "{\"where\":{\"zone_id\":\"" + zone_id + "\"}}"
      })
    };
    return this.http.get(url, newOption)
    .pipe(map((res:Areas[]) => {return res}));
  }

  public deleteAreas(id:number){
    var url = this.apiUrl + '/areas/' + id;
    return this.http.patch(url,{id : id, deleted : 1}, this.httpOptions)
    .pipe(map((res:any) => {return res}))
    
  }


}
