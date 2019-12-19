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

  getTasks(): Observable<Task[]>{
    return this.http.get<{ results: Task[]; }>(this.tasksUrl).pipe(
        map(response=> response.results),
        catchError(this.handleError)
    );
  }

  deleteTask(id: number): Observable<any>{

    return this.http.delete(this.tasksUrl+'/'+`${id}`)
    .pipe(
      catchError(this.handleError)
    );
  }

  getAnnotationFormats(): Observable<AnnotationFormat[]>{
    return this.http.get(this.annotationFormatsUrl)
    .pipe(
      map(response => response as AnnotationFormat[]),
      catchError(this.handleError)
    );
  }

/* This error handler doesn't really do anything besides log to the console
But I'll leave it here as a placeholder if someone wants to
actually implement error handling */

  private handleError(error: unknown) {
    if(error instanceof HttpErrorResponse){
      console.error(error.message);
    }
    return throwError(error);
  }



}
