import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Task } from './models/task/task';
import { AnnotationFormat } from './models/annotation-formats/annotation-format';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private tasksUrl=environment.apiUrl+'api/v1/tasks';
  private annotationFormatsUrl=environment.apiUrl+'api/v1/server/annotation/formats';

  constructor(private http: HttpClient) { }

  /**
   * Retrieves task data from backend in the form of an array of type Task
   * Performs a get
   * @return      Observable<Task[]>
   */
  getTasks(): Observable<Task[]>{
    return this.http.get<{ results: Task[]; }>(this.tasksUrl).pipe(
        map(response=> response.results),
        catchError(this.handleError)
    );
  }

  /**
   * Removes a task from backend using http delete
   * @param id number represented to be deleted task's id number
   * @return      Observable<any
   */
  deleteTask(id: number): Observable<any>{

    return this.http.delete(this.tasksUrl+'/'+`${id}`)
    .pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Retrieves all permissible annotation formats with an http get
   * @return      Observable<AnnotationFormat[]>
   */
  getAnnotationFormats(): Observable<AnnotationFormat[]>{
    return this.http.get(this.annotationFormatsUrl)
    .pipe(
      map(response => response as AnnotationFormat[]),
      catchError(this.handleError)
    );
  }

//TODO: Implement more useful error handling
  private handleError(error: unknown) {
    if(error instanceof HttpErrorResponse){
      console.error(error.message);
    }
    return throwError(error);
  }



}
