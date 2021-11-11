import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from './user';
import { Message } from './message';

const URL = 'http://localhost:8080/api';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  // UserService will store logged in user data
  isLogin: boolean = false;
  loginUserData: User;

  constructor(private http: HttpClient) {}

  // Function for logging in
  login(user: User) {
    return this.http.post(URL + '/login', user, { withCredentials: true });
  }

  // Function for logging out
  logout() {
    return this.http.get(URL + '/logout', { withCredentials: true });
  }

  // Function for registering
  register(user: User) {
    return this.http.post(URL + '/register', user, { withCredentials: true });
  }

  getUsers() {
    return this.http.get(URL + '/users', { withCredentials: true });
  }

  getMessages(id: number) {
    return this.http.get(URL + '/messages/' + id.toString(), {
      withCredentials: true,
    });
  }

  sendMessages(mes: Message) {
    return this.http.post(URL + '/messages', mes, { withCredentials: true });
  }

  // Setter for loginUserData
  set user(user: User) {
    this.loginUserData = user;
  }
}
