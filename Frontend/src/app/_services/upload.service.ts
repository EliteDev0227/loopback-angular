import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpErrorResponse, HttpEventType } from  '@angular/common/http';
import { map } from  'rxjs/operators';
import { environment } from '../_services/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  SERVER_URL: string = environment.apiUrl;
  constructor(private httpClient: HttpClient) { }
  public upload(data) {
    let uploadURL = `${this.SERVER_URL}/containers/profile/upload`;

    return this.httpClient.post<any>(uploadURL, data, {
      reportProgress: true,
      observe: 'events'
    }).pipe(map((event) => {

      switch (event.type) {

        case HttpEventType.UploadProgress:
          const progress = Math.round(100 * event.loaded / event.total);
          return { status: 'progress', message: progress };

        case HttpEventType.Response:
          return event.body;
        default:
          return `Unhandled event: ${event.type}`;
      }
    })
    );
  }
}
