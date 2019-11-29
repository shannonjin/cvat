import {Component, Input, ViewChild,ViewContainerRef,ComponentFactoryResolver,
ComponentRef, TemplateRef, OnInit} from '@angular/core';
import { Task } from '../models/task/task';
import {MatDialog} from '@angular/material/dialog';
import { environment } from '../../environments/environment';
import { AnnotationFormat } from '../models/annotation-formats/annotation-format';
import { Dumper } from '../models/annotation-formats/dumper';
import { Loader } from '../models/annotation-formats/loader';
import { DashboardItemService } from '../dashboard-item.service';

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
  dumpers: Dumper[]=[];
  loaders: Loader[]=[];

  compInteraction: deleteTaskInterface;
  apiUrl = environment.apiUrl+"api/v1/tasks/";

  constructor(private matDialog:MatDialog, private dashboardItemService: DashboardItemService) { }

  /*No particular reason to*/
  ngOnInit() {

    for(let format of this.annotationFormats){
      for(let dumper of format.dumpers){
        this.dumpers.push(dumper);
      }
      for(let loader of format.loaders){
        this.loaders.push(loader);
      }
    }



  }

  openDeleteModal(templateRef: TemplateRef<any>){
    const dialogRef=this.matDialog.open(templateRef,
    {
      width: '400px',
    });
  }

  delete(id: number){
    this.compInteraction.delete(id);
  }

  dump(selectedDump: Dumper){
    if(selectedDump!=null){
      console.log(this.task.id);
      console.log(selectedDump.display_name);
      this.dashboardItemService.getDump(this.task.id,this.task.name, selectedDump.display_name)
      .subscribe();
    }
  }

  upload(selectedUpload: AnnotationFormat){

  }
}
