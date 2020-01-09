import { Injectable, Injector } from '@angular/core';
import { HttpClient,HttpHeaders, HttpEventType, } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Surveys } from '@app/_models/Surveys';
import { environment } from '@app/_services/environment';
@Injectable({
  providedIn: 'root'
})
export class SurveysService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };
  apiUrl : string = environment.apiUrl;
  constructor(private http : HttpClient) { }

  public AddToSurveys(info:any):Observable<Surveys>{
    var url = this.apiUrl + '/Surveys';
    return this.http.post(url,info,this.httpOptions)
    .pipe(map((res:Surveys) => {return res}));
  }
  
  public getSurveysById(id:number):Observable<Surveys>{
    var url = this.apiUrl + '/Surveys/' + id ;
    return this.http.get(url)
    .pipe(map((res:Surveys) => {return res}));
  }

  public getSurveys():Observable<Surveys[]>{
    var url = this.apiUrl + '/Surveys' ;
    return this.http.get(url)
    .pipe(map((res:Surveys[]) => {return res}));
  }

  

  public deleteSurveys(id:number){
    var url = this.apiUrl + '/Surveys/' + id;
    return this.http.patch(url,{id : id, deleted : 1}, this.httpOptions)
    .pipe(map((res:any) => {return res}));

    // var url = this.apiUrl + '/Surveys/' + id ;
    // return this.http.delete(url)
    // .pipe(map((res:any) => {return res}));

  }


}
