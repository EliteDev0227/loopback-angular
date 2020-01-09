import { Injectable, Injector } from '@angular/core';
import { HttpClient,HttpHeaders, HttpEventType, } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Settings } from '@app/_models/settings';
import { environment } from '@app/_services/environment';
@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };
  apiUrl : string = environment.apiUrl;
  constructor(private http : HttpClient) { }

  public AddToSettings(info:any):Observable<Settings>{
    var url = this.apiUrl + '/Settings';
    return this.http.post(url,info, this.httpOptions)
    .pipe(map((res:Settings) => {return res}));
  }

  public SaveSettings(info:any):Observable<any>{
    var url = this.apiUrl + '/Settings/saveAll';
    return this.http.post(url,{
      data : info
    }, this.httpOptions)
    .pipe(map((res:any) => {return res}));
  }
  
  public getSettingsById(id:number):Observable<Settings>{
    var url = this.apiUrl + '/Settings/' + id ;
    return this.http.get(url)
    .pipe(map((res:Settings) => {return res}));
  }

  public getSettings():Observable<Settings[]>{
    var url = this.apiUrl + '/Settings' ;
    return this.http.get(url)
    .pipe(map((res:Settings[]) => {return res}));
  }

  public getUnassignedSettings():Observable<Settings[]>{
    var url = this.apiUrl + '/Settings/unassigned' ;
    return this.http.get(url)
    .pipe(map((res:any) => {return res.data}));
  }

  public getFailedSettings():Observable<Settings[]>{
    var url = this.apiUrl + '/Settings/failed' ;
    return this.http.get(url)
    .pipe(map((res:any) => {return res.data}));
  }

  public getRejectedSettings():Observable<Settings[]>{
    var url = this.apiUrl + '/Settings/rejected' ;
    return this.http.get(url)
    .pipe(map((res:any) => {return res.data}));
  }

  public deleteSettings(id:number){
    var url = this.apiUrl + '/Settings/' + id ;
    return this.http.delete(url)
    .pipe(map((res:any) => {return res}));
  }


}
