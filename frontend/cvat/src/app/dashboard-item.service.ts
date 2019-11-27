import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { environment } from '../environments/environment';

import { Observable, throwError, of, iif} from 'rxjs';
import { catchError, map, retryWhen, filter, concatMap, delay, flatMap } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DashboardItemService {

  httpOptions={
      responseType: 'text',
      observe: 'response'
  };



  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) { }

  getDump(tid, taskName, formatName){

    taskName = taskName.replace(/\//g, '_');
    //const url = environment.apiUrl+`/api/v1/tasks/${tid}/annotations/${taskName}`;
    const url="sdnsn";
    let queryString = `format=${formatName}`;

    console.log(`${url}?${queryString}`);

    return this.http.get(`${url}?${queryString}`, {observe: 'response', responseType:'text'})
    .pipe(
      map((response: HttpResponse<any>)=> {

         if(response.status===202){
           throw response;
        }
        else{
         console.log("wahtao");
         console.log(response.status);
         queryString = `${queryString}&action=download`;
         this.document.location.href=`${url}?${queryString}`;
        }
        return response;
      }),
      retryWhen( obs => { return obs.pipe(
        concatMap((error, index) =>{
          console.log("hyolyn");
          if(error.status !== 202){
            console.log(error.status);
            return throwError(error);
          }
          return iif(
            () => index >= 10,
            throwError(new Error('Operation Timed Out!')),
            of(error).pipe(delay(3000))
            )
        })
      )}),
      catchError(this.handleError)
    );
  }

  putUpload(){

  }


  private handleError(error: unknown, message: string ="") {
    console.log(message);
    console.log("eye");
    if(error instanceof HttpErrorResponse){
      console.error(error.message);
    }
    return throwError(error);
  }

}
