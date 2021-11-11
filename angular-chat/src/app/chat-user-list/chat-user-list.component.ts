import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../user';

@Component({
  selector: 'app-chat-user-list',
  templateUrl: './chat-user-list.component.html',
  styleUrls: ['./chat-user-list.component.scss']
})
export class ChatUserListComponent implements OnInit {

  // Component input data - user list of users
  @Input() users: User[];

  // Component output data - event called after clicking on a user
  @Output() userClicked: EventEmitter<User> = new EventEmitter();
  
  constructor() { }

  ngOnInit() {

  }
}
