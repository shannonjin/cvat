import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { environment } from '../environments/environment';

import { Observable, throwError, of, iif} from 'rxjs';
import { catchError, map, retryWhen, filter, concatMap, delay, flatMap } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { Loader } from './models/annotation-formats/loader';


@Injectable({
  providedIn: 'root'
})
export class DashboardItemService {


  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) { }

  getDump(tid:number, taskName:string, formatName:string){

    taskName = taskName.replace(/\//g, '_');
    const url = environment.apiUrl+`/api/v1/tasks/${tid}/annotations/${taskName}`;

    let queryString = `format=${formatName}`;

    return this.http.get(`${url}?${queryString}`, {observe: 'response', responseType:'text'})
    .pipe(
      map((response: HttpResponse<any>)=> {

         if(response.status===202){
           throw response;
        }
        else{
         queryString = `${queryString}&action=download`;
         this.document.location.href=`${url}?${queryString}`;
        }
        return response;
      }),
      retryWhen( obs => { return obs.pipe(
        concatMap((error, index) =>{
          if(error.status !== 202){
            return throwError(error);
          }
          return iif(
            () => index >= 10,
            throwError(new Error('Operation Timed Out!')),
            of(error).pipe(delay(3000))
            )
        })
      )}),
      catchError(this.handleError("Can not dump annotations for the task."))
    );
  }

  putUpload(tid:number, fileToUpload: File, format: Loader){

    const queryString = `format=${format.display_name}`;
    const url = environment.apiUrl+`/api/v1/tasks/${tid}/annotations?${queryString}`;

    let annotationData = new FormData();
    annotationData.append('annotation_file', fileToUpload);

    return this.http.put(url, annotationData, {observe: 'response', responseType:'text'})
    .pipe(
      map((response: HttpResponse<any>)=> {
         if(response.status===202){
           throw response;
        }
        return response;
      }),
      retryWhen( obs => { return obs.pipe(
        concatMap((error, index) =>{
          if(error.status !== 202){
            return throwError(error);
          }
          return iif(
            () => index >= 10,
            throwError(new Error('Operation Timed Out!')),
            of(error).pipe(delay(3000))
            )
        })
      )}),
      catchError(this.handleError(`Can not upload annotations for the task ${tid}.`))
    );
  }



  private handleError<T>(message: string ="") {

    return(error:any): Observable<T> =>{
      message=message+` Code: ${error.status}. `
                        + `Message: ${error.message || error.error}`;
      //console.log(message);
      return throwError(new Error(message));
    }
  }
}
