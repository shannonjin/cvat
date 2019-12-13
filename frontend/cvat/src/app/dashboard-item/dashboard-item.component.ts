import {Component, Input, ViewChild,ViewContainerRef,ComponentFactoryResolver,
ComponentRef, TemplateRef, OnInit, ElementRef} from '@angular/core';
import { Task } from '../models/task/task';
import { Label } from '../models/task/label';
import {MatDialog} from '@angular/material/dialog';
import { environment } from '../../environments/environment';
import { AnnotationFormat } from '../models/annotation-formats/annotation-format';
import { Dumper } from '../models/annotation-formats/dumper';
import { Loader } from '../models/annotation-formats/loader';
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
  dumpers: Dumper[]=[];
  oldLabels: string;

  loaders: Loader[]=[];
  selectedLoader: Loader=null;
  fileToUpload: File = null;

  message: string;
  @ViewChild('messageTemplate', {static: false}) messageTemplate: ElementRef;

  @ViewChild('uploader', {static: false}) uploader: ElementRef;

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

  openModal(templateRef: TemplateRef<any>){
    const dialogRef=this.matDialog.open(templateRef,
    {
      width: '400px',
    });
  }

  getOldLabels(){
    this.oldLabels=LabelsInfoService.serialize(this.task.labels);
  }

  delete(id: number){
    this.compInteraction.delete(id);
  }


  update(newLabel: string){

    const labels = LabelsInfoService.deserialize(newLabel);
    labels.forEach(item => this.task.labels.push(item));

    this.dashboardItemService.saveTask(this.task)
    .subscribe(
      x =>{},
      err => {
        this.message=err;
        if(err instanceof HttpErrorResponse && !(err.error instanceof ErrorEvent)){
          message += ` Code: ${err.status}`;
        }
      },
      () =>{ this.message='Task has been successfully updated';}
    );


    this.openModal(this.messageTemplate);
  }


  dump(selectedDump: Dumper){
    if(selectedDump!=null){
      this.dashboardItemService.getDump(this.task.id,this.task.name, selectedDump.display_name)
      .subscribe();
    }
  }

  upload(selectedUpload: Loader){
    this.selectedLoader=selectedUpload;

    /*this works because setTimeout (js) puts whatever inside it
      to the end of the event queue so Angular can do change detection
      and update view before popup (file dialog window) comes out
    */
    setTimeout(() => this.uploader.nativeElement.click(), 0);
  }

  onFileChange(files: FileList){
    //this.fileToUpload = event.target.files;
    this.fileToUpload = files.item(0);
    this.dashboardItemService.putUpload( this.task.id, this.fileToUpload, this.selectedLoader).subscribe();
  }




}
