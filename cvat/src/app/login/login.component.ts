import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';
import { NgForm, FormBuilder, FormGroup, FormControl} from '@angular/forms';
import { LoginService } from '../login.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private cookieValue: string;
  response: string;

  title='Login';
  loginUrl=environment.apiUrl+'auth/login1';
  loginForm: FormGroup;

  constructor(private router: Router, private fb: FormBuilder, private cookieService: CookieService, private loginService: LoginService) {}

  /**
   * Retrieves and stores csrftoken
   * Creates login form
   * @return      none: return type is void
   */
  ngOnInit() {
    this.cookieValue=this.cookieService.get('csrftoken');
    this.loginForm = this.fb.group({
      username: [''],
      password:['']
    })
  }

  /**
   * Called after user fills in login info and clicks login
   * Creates FormData object, populates with login info and csrf token
   * (id=dashboardNewLabels) from ng-template #updateModalTemplate in dashboard.component.html
   * Passes form to loginService's signIn method. If the response returned is positive
   * navigate to dashboard page
   * @return      none: return type is void
   */
  onSubmit() {
    const loginData = new FormData();
    loginData.append('username', this.loginForm.get('username').value);
    loginData.append('password', this.loginForm.get('password').value);
    loginData.append('csrfmiddlewaretoken',this.cookieValue);


    this.loginService.signIn(loginData).subscribe(response => this.response = response);

  //TODO: add error handling
    if(this.response!="Your username and password didn't match. Please try again."){
      this.router.navigate(['./dashboard']);
      sessionStorage.setItem('username', loginData.get('username').toString());
      sessionStorage.setItem('password', loginData.get('password').toString());
    }
  }


}
