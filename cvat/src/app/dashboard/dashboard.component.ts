import { Component, OnInit, Input, ComponentRef, ComponentFactoryResolver, OnDestroy,
ViewContainerRef, ViewChild,TemplateRef} from '@angular/core';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TaskConfigurationModalComponent } from '../task-configuration-modal/task-configuration-modal.component';
import { DashboardService } from '../dashboard.service';
import { Task } from '../models/task/task';
import { DashboardItemComponent } from '../dashboard-item/dashboard-item.component';
import { AnnotationFormat } from '../models/annotation-formats/annotation-format';
import { forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  @ViewChild('taskView', {static: true, read: ViewContainerRef}) vc: ViewContainerRef;
  @ViewChild('messageTemplate', {read: TemplateRef, static:false}) messageTemplate: TemplateRef<any>;

  title='CVAT Dashboard';
  taskRef: ComponentRef<any>[]=[];
  message: string;

  constructor(private matDialog: MatDialog, private dashboardService: DashboardService,
  private CFR: ComponentFactoryResolver) { }

  /**
   * Uses dashboardService to retrieve metadata and
   * task data from backend. On success components are
   * created to display each task and it's associated information.
   * the component references are stored in the taskRef array.
   @return      none: return type is void
   */
  ngOnInit() {

    forkJoin(
      this.dashboardService.getAnnotationFormats(),
      this.dashboardService.getTasks(),
    ).subscribe( results=>{
      for(let task of results[1]){
        const componentFactory=this.CFR.resolveComponentFactory(DashboardItemComponent);
        const componentRef=this.vc.createComponent(componentFactory);
        componentRef.instance.task=task;
        componentRef.instance.annotationFormats=results[0];
        componentRef.instance.compInteraction=this;
        this.taskRef.push(componentRef);
      }
    }
  );
}

/**
 * Opens an angular material dialog that contains the TaskConfigurationModalComponent
 No parameters, no return (return type void)
 @return      none: return type is void
 */
  dashboardCreateTaskButton() {
    const dialogRef = this.matDialog.open(TaskConfigurationModalComponent, {
     width: '500px',
   });
  }

  /**
   * Deletes task, as identified by it's id number, from dashboard and
   * backend. Does so by calling dashboardService's deleteTask method, and
   * passes to deleted task's id to dashboardService. On the dashboardService's
   * success dynamically destroys the component representing the task.
   * Otherwise catches and displays error to user by opening a material dialog.
   *
   * Bound to the delete button in dashboard.component.html, called when clicked.
   *
   * @param  id  number representing the id number of task to be deleted
   * @return      none: return type is void
   */
  delete(id: number){
    this.dashboardService.deleteTask(id).subscribe(
      (val) => {

        try{
          let componentRef = this.taskRef.find(x => x.instance.task.id === id);
          this.taskRef=this.taskRef.filter(x=>x.instance.task.id!=id);
          componentRef.destroy();

        }
        catch(e){
          this.message="Delete encountered an error: "+e.error;
          this.matDialog.open(this.messageTemplate);
        }
      }
    );
  }

  /**
   * Bound to User Guide button in dashboard.component.html. Triggered
   * when clicked. Navigates to http://localhost:8080/documentation/user_guide.html
   * using an environment variable that represents the different port hosting
   * the backend.
   *
   * @return      none: return type is void
   */
  navigateToUserGuide(){
    window.location.href=environment.backendUrl+"/documentation/user_guide.html";
  }

}
