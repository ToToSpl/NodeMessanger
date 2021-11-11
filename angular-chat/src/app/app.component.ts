import { Component } from '@angular/core';
import { HttpService } from './http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    public httpService: HttpService,
    private router: Router) {
  }

  logout() {
    this.httpService.logout().subscribe(
      data => {
        if ("loggedin" in data) {
          if ((data as any)["loggedin"] === false) {
            this.httpService.isLogin = false;
            this.httpService.user = null;
            this.router.navigate(['/login']);
            console.log("logout");
          }
        }
      });
  }
}
