import { Injectable, Injector } from '@angular/core';
import { HttpClient,HttpHeaders, HttpEventType, } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Items } from '@app/_models/Items';
import { environment } from '@app/_services/environment';
@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };
  apiUrl : string = environment.apiUrl;
  constructor(private http : HttpClient) { }

  public AddToItems(info:any):Observable<Items>{
    var url = this.apiUrl + '/items';
    return this.http.post(url,info,this.httpOptions)
    .pipe(map((res:Items) => {return res}));
  }
  
  public getItemsById(id:number):Observable<Items>{
    var url = this.apiUrl + '/items/' + id ;
    return this.http.get(url)
    .pipe(map((res:Items) => {return res}));
  }

  public getItems():Observable<Items[]>{
    var url = this.apiUrl + '/items' ;
    return this.http.get(url)
    .pipe(map((res:Items[]) => {return res}));
  }

  

  public deleteItems(id:number){
    var url = this.apiUrl + '/items/' + id ;
    return this.http.delete(url)
    .pipe(map((res:any) => {return res}));
  }


}
