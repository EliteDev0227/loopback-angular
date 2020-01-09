import { Injectable, Injector } from '@angular/core';
import { HttpClient,HttpHeaders, HttpEventType, } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Drivers } from '@app/_models/Drivers';
import { environment } from '@app/_services/environment';
import { UserService } from './user.service';
@Injectable({
  providedIn: 'root'
})
export class DriversService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };
  apiUrl : string = environment.apiUrl;
  constructor(private http : HttpClient,
    private userService : UserService) { }

  public AddToDrivers(info:any):Observable<Drivers>{
    if (!info.id) {
      var url = this.apiUrl + '/drivers';
      return this.http.post(url,info, this.httpOptions)
      .pipe(map((res:Drivers) => {return res}));
  
    }
    else {
      var url = this.apiUrl + '/drivers/' + info.id;
      return this.http.patch(url,info, this.httpOptions)
      .pipe(map((res:Drivers) => {return res}));

    }
  }

  public changePassword(id : number, phone : string, password: string):Observable<any>{
      var url = this.apiUrl + '/drivers/changePassword';
      return this.http.post(url,{
        id : id,
        phone : phone,
        password : password
      }, this.httpOptions)
      .pipe(map((res:any) => {return res}));
  }
  
  public getTotalWallet():Observable<any>{
    var url = this.apiUrl + '/drivers/getTotalWallet';
    return this.http.get(url)
    .pipe(map((res:any) => {return res}));
  }

  public getDriversById(id:number):Observable<Drivers>{
    var url = this.apiUrl + '/drivers/' + id ;
    return this.http.get(url)
    .pipe(map((res:Drivers) => {return res}));
  }

  public getDrivers():Observable<Drivers[]>{
    var url = this.apiUrl + '/drivers' ;
    return this.http.get(url)
    .pipe(map((res:Drivers[]) => {return res}));
  }

  public getUnassignedDrivers():Observable<Drivers[]>{
    var url = this.apiUrl + '/drivers/unassigned' ;
    return this.http.get(url)
    .pipe(map((res:Drivers[]) => {return res}));
  }

  public deleteDrivers(id:number){
    var url = this.apiUrl + '/drivers/' + id;
    return this.http.patch(url,{id : id, deleted : 1}, this.httpOptions)
    .pipe(map((res:any) => {
      return res;
    }));
    // var url = this.apiUrl + '/drivers/' + id ;
    // return this.http.delete(url)
    // .pipe(map((res:any) => {return res}));
  }


}
