import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

import { Observable, throwError, of, iif} from 'rxjs';
import { catchError, map, retryWhen, filter, concatMap, delay, flatMap } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { Annotation } from './models/annotation-formats/annotation';
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

/**
 * Downloads selected task's annotation format from backend
 * Constructs the url and performs a get
 * If response status is 202, will retry the get until response changes or
 * ten tries are all used up. When the response has changed, creates a link
 * to attempt to download the resource returned by get. Otherwise if 10 tries
 * are used up an error will be thrown.
 * @param tid number representing id of the task from which an annotation format is to be downloaded
 *            from
 * @param taskName string representing name of task from which an annotation format
 *                  is to be downloaded from
 * @param formatName string representing name of format to be downloaded
 * @return      HttpResponse
 */
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

/**
 * Uploads task associated selected annotation format to backend
 * Constructs the url and performs a put
 * If response status is 202, will retry the put until response changes or
 * ten tries are all used up. If 10 tries are used up an error will be thrown.
 *
 * @param tid number representing id of the task for which an annotation format is to be put
 * @param taskName string representing name of task from which an annotation format
 *                  is to be downloaded from
 * @param format annotation format, used to construct url and convey the annotation format type
 *               of the file
 * @param fileToUpload type File that will be passed in the put request to backend
 * @return      HttpResponse
 */
  putUpload(tid:number, fileToUpload: File, format: Annotation){

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


  /**
   * Sends the updated task (the task after the user added more labels through the update task modal)
   * back to backend. Performs a patch. This function is a mirror of the async function saveTask
   * in cvat-core.min.js
   * @param task Updated task to be patched to backend
   * @return      HttpResponse
   */
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

/**
  * generic handleerror function for all the service methods.
  * @param message string that conveys information about the error's origins
  * @return type Error
*/
  private handleError<T>(message: string ="") {

    return(error:any): Observable<T> =>{
      message=message+` Code: ${error.status}. `
                        + `Message: ${error.message || error.error}`;
      return throwError(new Error(message));
    }
  }
}
