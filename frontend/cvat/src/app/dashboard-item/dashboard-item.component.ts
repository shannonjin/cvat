import {Component, Input, ViewChild,ViewContainerRef,ComponentFactoryResolver,
ComponentRef, TemplateRef} from '@angular/core';
import { Task } from '../models/task/task';
import {MatDialog} from '@angular/material/dialog';
import { environment } from '../../environments/environment';
import { AnnotationFormat } from '../models/annotation-formats/annotation-format';

export interface deleteTaskInterface{
  delete(id: number);
}

@Component({
  selector: 'app-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.css']
})
export class DashboardItemComponent{
  task: Task;
  annotationFormats: AnnotationFormat[];

  compInteraction: deleteTaskInterface;
  imgUrl = environment.apiUrl+"api/v1/tasks/";

  constructor(private matDialog:MatDialog) { }

  openDeleteModal(templateRef: TemplateRef<any>){
    const dialogRef=this.matDialog.open(templateRef,
    {
      width: '400px',
    });
  }

  delete(id: number){
    this.compInteraction.delete(id);
  }
}
