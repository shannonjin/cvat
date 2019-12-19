import {Component, Input, ViewChild,ViewContainerRef,ComponentFactoryResolver,
ComponentRef, TemplateRef, OnInit, ElementRef} from '@angular/core';
import { Task, Label} from '../models/task';
import {MatDialog} from '@angular/material/dialog';
import { environment } from '../../environments/environment';
import { AnnotationFormat, Annotation } from '../models/annotation-formats';
import { } from '../models/annotation-formats/annotation';
import { DashboardItemService } from '../dashboard-item.service';
import { LabelsInfoService } from '../labels-info.service';
import { HttpErrorResponse } from '@angular/common/http';

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
  dumpers: Annotation[]=[];
  oldLabels: string;

  loaders: Annotation[]=[];
  selectedLoader: Annotation=null;
  fileToUpload: File = null;

  message: string;
  @ViewChild('messageTemplate', {read: TemplateRef, static:false}) messageTemplate: TemplateRef<any>;

  @ViewChild('uploader', {static: false}) uploader: ElementRef;

  compInteraction: deleteTaskInterface;
  apiUrl = environment.apiUrl+"api/v1/tasks/";

  constructor(private matDialog:MatDialog, private dashboardItemService: DashboardItemService) { }

  ngOnInit() {

    //populating the drop down menu of dump annotation menu options and upload menu options.
    for(let format of this.annotationFormats){
      for(let dumper of format.dumpers){
        this.dumpers.push(dumper);
      }
      for(let loader of format.loaders){
        this.loaders.push(loader);
      }

    }
  }

  openModal(templateRef: TemplateRef<any>){
    const dialogRef=this.matDialog.open(templateRef,
    {
      width: '400px',
    });
  }

  getTaskOldLabels(){
    this.oldLabels=LabelsInfoService.serialize(this.task.labels);
  }

  deleteTask(id: number){
    this.compInteraction.delete(id);
  }


  updateTask(newLabel: string){

    const labels = LabelsInfoService.deserialize(newLabel);
    labels.forEach(item => this.task.labels.push(item));

    this.dashboardItemService.saveTask(this.task)
    .subscribe(
      x =>{},
      err => {
        this.message=err;
        if(err instanceof HttpErrorResponse && !(err.error instanceof ErrorEvent)){
          this.message += ` Code: ${err.status}`;
        }
      },
      () =>{ this.message='Task has been successfully updated';}
    );


    this.openModal(this.messageTemplate);
  }


  dumpAnnotation(selectedDump: Annotation){
    if(selectedDump!=null){
      this.dashboardItemService.getDump(this.task.id,this.task.name, selectedDump.display_name)
      .subscribe();
    }
  }

  uploadAnnotation(selectedUpload: Annotation){
    this.selectedLoader=selectedUpload;

    /*this works because setTimeout (js) puts whatever inside it
      to the end of the event queue so Angular can do change detection
      and update view before popup (file dialog window) comes out
    */
    setTimeout(() => this.uploader.nativeElement.click(), 0);
  }

  onFileChange(files: FileList){
    this.fileToUpload = files.item(0);
    this.dashboardItemService.putUpload( this.task.id, this.fileToUpload, this.selectedLoader).subscribe();
  }




}
