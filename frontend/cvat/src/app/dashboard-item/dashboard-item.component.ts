import {Component, Input, ViewChild,ViewContainerRef,ComponentFactoryResolver,
ComponentRef, TemplateRef, OnInit} from '@angular/core';
import { Task } from '../models/task/task';
import {MatDialog} from '@angular/material/dialog';
import { environment } from '../../environments/environment';
import { AnnotationFormat } from '../models/annotation-formats/annotation-format';
import { Dumper } from '../models/annotation-formats/dumper';
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

  compInteraction: deleteTaskInterface;
  apiUrl = environment.apiUrl+"api/v1/tasks/";

  constructor(private matDialog:MatDialog, private dashboardItemService: DashboardItemService) { }

  /*No particular reason to*/
  ngOnInit() {

    for(let format of this.annotationFormats){
      for(let dumper of format.dumpers){
        this.dumpers.push(dumper);
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


      .subscribe(
        suc => {
            console.log(suc);
        },
        err => {
            console.log("dope");
            console.log(err );
        }
      );

      /* These lines are taken straight from CVAT source Code
         ALMOST verbatim. ALMOST. */
    /*  taskName = taskName.replace(/\//g, '_');
      const name = encodeURIComponent(`${tid}_${taskName}`);
      const dumpUrl=`${this.apiUrl}${this.task.id}/annotations/${name}?format=${n}`; */

    }
  }

  upload(selectedUpload: AnnotationFormat){

  }
}
