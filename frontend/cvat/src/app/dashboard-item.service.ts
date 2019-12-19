import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

import { Observable, throwError, of, iif} from 'rxjs';
import { catchError, map, retryWhen, filter, concatMap, delay, flatMap } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { Loader } from './models/annotation-formats/loader';
import { Task }  from './models/task/task';


@Injectable({
  providedIn: 'root'
})
export class DashboardItemService {

  httpOptions={
     responseType: 'text',
     observe: 'response'
 };

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) { }

//downloads selected annotation format the task's dump annotation drop down menu
  getDump(tid:number, taskName:string, formatName:string){

    taskName = taskName.replace(/\//g, '_');
    const url = environment.apiUrl+`/api/v1/tasks/${tid}/annotations/${taskName}`;

    let queryString = `format=${formatName}`;

    return this.http.get(`${url}?${queryString}`, {headers: this.httpOptions})
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

//uploads selected annotation format the task's upload annotation drop down menu
  putUpload(tid:number, fileToUpload: File, format: Loader){

    const queryString = `format=${format.display_name}`;
    const url = environment.apiUrl+`/api/v1/tasks/${tid}/annotations?${queryString}`;

    let annotationData = new FormData();
    annotationData.append('annotation_file', fileToUpload);

    return this.http.put(url, annotationData, {headers: this.httpOptions})
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

  //Called when user updates the task by clicking the update button and expands
  //the specification in the modal that shows up
  //Sends the updated task back to backend
  //see async function saveTask in cvat-core.min.js
  saveTask(task: Task){

    const url=environment.apiUrl+`/api/v1/tasks/${task.id}`;
    let headers=new HttpHeaders();
    headers=headers.set('Content-Type', 'application/json');

   for(let key of Object.keys(this.httpOptions)){
      let item=this.httpOptions[key];
      headers.append(key, item);
    }

    const t={
      name:task.name,
      bug_tracker:task.bug_tracker,
      z_order:task.z_order,
      labels:task.labels
    };

    return this.http.patch(url, JSON.stringify(t), {headers: headers})
    .pipe(
        catchError(this.handleError(`Could not save the task on the server.`))
    );
  }

//generic handleerror function for all the service methods.
  private handleError<T>(message: string ="") {

    return(error:any): Observable<T> =>{
      message=message+` Code: ${error.status}. `
                        + `Message: ${error.message || error.error}`;
      return throwError(new Error(message));
    }
  }
}
