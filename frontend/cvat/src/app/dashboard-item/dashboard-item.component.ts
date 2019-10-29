import { Component, Input} from '@angular/core';
import { Task } from '../models/task';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.css']
})
export class DashboardItemComponent{
  @Input() task: Task;
  imgUrl = environment.apiUrl+"api/v1/tasks/";
}
