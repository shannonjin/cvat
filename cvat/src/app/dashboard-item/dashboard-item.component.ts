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

  /**
   * Populating the drop down menu of
   * dump annotation menu options and upload menu options.
   * @return      none: return type is void
   */
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

  /**
   * Opens an angular material dialog as specified by @param templateRef
    @param  templateRef  reference to the html template to be opened in the mdoal
   @return      none: return type is void
   */
  openModal(templateRef: TemplateRef<any>){
    const dialogRef=this.matDialog.open(templateRef,
    {
      width: '400px',
    });
  }

  /**
   * Opens an angular material dialog as specified by @param templateRef
    @param  templateRef  reference to the html template to be opened in the mdoal
   @return      none: return type is void
   */
  getTaskOldLabels(){
    this.oldLabels=LabelsInfoService.serialize(this.task.labels);
  }

  /**
   * Opens an angular material dialog as specified by @param templateRef
    @param  templateRef  reference to the html template to be opened in the mdoal
   @return      none: return type is void
   */
  deleteTask(id: number){
    this.compInteraction.delete(id);
  }

  /**
   * Called after user clicks the update button on the update modal (material dialog)
   * Takes what was typed into the "expand specification here" input box
   * (id=dashboardNewLabels) from ng-template #updateModalTemplate in dashboard.component.html
   * converts into labels, adds to preexisting labels in the task's label array and attempts
   * to save the updated task to the backend (calls dashboardItemService.saveTask)
   * Displays success message or error message to user in material dialog by calling
   * openModal with a reference to the messageTemplate created in dashboard.component.html
   * @param  newLabel string representing what user typed into dashboardNewLabels input box
   * @return      none: return type is void
   */
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

  /**
   * Called when user selects option from dump annotations dropdown
   * Calls dashboardItemService's getDump to download selected annotation format
   * (id=dashboardNewLabels) from ng-template #updateModalTemplate in dashboard.component.html
   * @param  selectedDump represents the Annotation format user choose from drop down menu
   * @return      none: return type is void
   */
  dumpAnnotation(selectedDump: Annotation){
    if(selectedDump!=null){
      this.dashboardItemService.getDump(this.task.id,this.task.name, selectedDump.display_name)
      .subscribe();
    }
  }

  /**
   * Called when user selects option from upload annotations dropdown
   * Opens a file selection window
   * (id=dashboardNewLabels) from ng-template #updateModalTemplate in dashboard.component.html
   * @param  selectedUpload represents the Annotation format user choose from drop down menu
   *                        all other formats beside this one should not be selectable from
   *                        the file chooser menu
   * @return      none: return type is void
   */
  uploadAnnotation(selectedUpload: Annotation){
    this.selectedLoader=selectedUpload;
    setTimeout(() => this.uploader.nativeElement.click(), 0);
  }

  /**
   * Called when user selects a file from the file selection window
   * See hidden input named uploader in dashboard.component.html
   * Passes chosen file to dashboardItemService's putUpload
   * (id=dashboardNewLabels) from ng-template #updateModalTemplate in dashboard.component.html
   * @param  files represents file or file(s) user selected
   * @return      none: return type is void
   */
  onFileChange(files: FileList){
    this.fileToUpload = files.item(0);
    this.dashboardItemService.putUpload( this.task.id, this.fileToUpload, this.selectedLoader).subscribe();
  }




}
