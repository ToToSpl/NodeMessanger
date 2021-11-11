import { Component, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../http.service';
import { User } from '../user';
import { Message } from '../message';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  users: User[] = [];

  messagesToUser: Message[] = [];

  selectedUser: User = null;

  constructor(private router: Router, private httpService: HttpService) {
    if (!httpService.isLogin) {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit() {
    this.reloadUsers();
  }

  getMyId() {
    return this.httpService.loginUserData.user_id;
  }

  sendMessage(e: string) {
    console.log(new Message(this.selectedUser.user_id, e))
    this.httpService
      .sendMessages(new Message(this.selectedUser.user_id, e))
      .subscribe(
        (data) => {
          console.log('ChatComponent, onSubmit:', data);
        },
        (error) => {}
      );
  }

  // Function reloading users
  reloadUsers() {
    this.httpService.getUsers().subscribe(
      (data) => {
        console.log(data)
        if ('data' in data) {
          console.log('data');
          if (Array.isArray((data as any)['data'])) {
            this.users = (data as any)['data'] as User[];
          }
        }
      },
      (error) => {}
    );
  }

  // function called, when a user will be selected
  userSelected(user: User) {
    this.selectedUser = user;
    console.log('Selected user', this.selectedUser);
    this.getMessagesWithSelectedUser();
  }

  // function getting list of messages with a given user
  getMessagesWithSelectedUser() {
    this.httpService.getMessages(this.selectedUser.user_id).subscribe(
      (data) => {
        if ('data' in data) {
          console.log(data);
          if (Array.isArray((data as any)['data'])) {
            this.messagesToUser = (data as any)['data'] as Message[];
          }
        }
      },
      (error) => {}
    );
  }
}
