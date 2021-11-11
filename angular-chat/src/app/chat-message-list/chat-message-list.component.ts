import { Component, OnInit, Input } from '@angular/core';
import { Message } from '../message';

@Component({
  selector: 'app-chat-message-list',
  templateUrl: './chat-message-list.component.html',
  styleUrls: ['./chat-message-list.component.scss']
})
export class ChatMessageListComponent implements OnInit {

  // Component input data = message and user id
  @Input() messages:Message[] = [];
  @Input() myId:number = 0;
  
  constructor() { }

  ngOnInit() {
  }

}
