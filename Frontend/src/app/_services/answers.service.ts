import { Injectable, Injector } from '@angular/core';
import { HttpClient,HttpHeaders, HttpEventType, } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Answers } from '@app/_models/Answers';
import { environment } from '@app/_services/environment';
@Injectable({
  providedIn: 'root'
})
export class AnswersService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };
  apiUrl : string = environment.apiUrl;
  constructor(private http : HttpClient) { }

  public AddToAnswers(info:any):Observable<Answers>{
    var url = this.apiUrl + '/Answers';
    return this.http.post(url,info,this.httpOptions)
    .pipe(map((res:Answers) => {return res}));
  }
  
  public getAnswersById(id:number):Observable<Answers>{
    var url = this.apiUrl + '/Answers/' + id ;
    return this.http.get(url)
    .pipe(map((res:Answers) => {return res}));
  }

  public getAnswers():Observable<Answers[]>{
    var url = this.apiUrl + '/Answers' ;
    return this.http.get(url)
    .pipe(map((res:Answers[]) => {return res}));
  }

  public saveAnswer(id : number, answer : string){
    var url = this.apiUrl + '/Answers/' + id ;
    return this.http.patch(url, {
      answer : answer
    }).pipe(map((res:Answers) => {return res}));
  }

  
  public getAnswersBySurveyId(id:number):Observable<Answers[]>{
    var url = this.apiUrl + '/Answers' ;
    var newOption = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'filter': "{\"where\":{\"survey_id\":\"" + id + "\"}}"
      })
    };
    return this.http.get(url,  newOption)
    .pipe(map((res:Answers[]) => {return res}));
  }

  

  public deleteAnswers(id:number){
    var url = this.apiUrl + '/Answers/' + id ;
    return this.http.delete(url)
    .pipe(map((res:any) => {return res}));
  }


}
