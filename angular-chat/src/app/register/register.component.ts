import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../http.service';
import { User } from '../user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  // form object
  registerForm: FormGroup | undefined;
  // saving informations, that thedata has been sent to the serwer and we are waiting for data
  loading = false;
  // saving infomrations, that a user clicked the form submit button
  submitted = false;
  // error list received from server
  serverErrors: String[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private httpService: HttpService
  ) {
    if (httpService.isLogin) {
      this.router.navigate(['/']);
    }
  }

  // Function called after component initialisation
  ngOnInit() {
    // Form field group creation
    this.registerForm = this.formBuilder.group({
      user_name: ['', [Validators.required, Validators.minLength(3)]],
      user_password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  // Form field getter
  get formControls() {
    return this.registerForm?.controls;
  }

  // Function accepting the form
  onSubmit() {
    this.submitted = true;
    this.serverErrors = [];

    // Validate form data
    if (this.registerForm?.invalid) {
      return;
    }

    this.loading = true;

    // Creating a user object from form data and send them to the server
    this.httpService
      .register(
        new User(
          0,
          this.registerForm?.controls['user_name'].value,
          this.registerForm?.controls['user_password'].value
        )
      )
      // Subscribe the http response data to data stream
      .subscribe(
        (data) => {
          if ('register' in data) {
            if ((data as any)['register'] === true) {
              this.router.navigate(['/login']);
            } else {
              this.loading = false;
              // add errors to the list if user could not be registered
              this.serverErrors.push(JSON.stringify(data));
              console.log('RegisterComponent, onSubmit:', data);
            }
          } else {
            // add errors to the list if user could not be registered
            this.loading = false;
            this.serverErrors.push(JSON.stringify(data));
            console.log('RegisterComponent, onSubmit:', data);
          }
        },
        (error) => {
          this.loading = false;
        }
      );
  }
}
