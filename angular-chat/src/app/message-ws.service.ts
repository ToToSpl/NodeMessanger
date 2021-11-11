import { Injectable, EventEmitter } from '@angular/core';
import { Message } from './message';

@Injectable({
  providedIn: 'root',
})
export class MessageWSService {
  ws: any;

  // Event notifing about a new message
  onMessage: EventEmitter<Message> = new EventEmitter();

  // Event notifing about connecting a new user
  onAnotherUserConneted: EventEmitter<boolean> = new EventEmitter();

  // Event notifing about a broken connection
  onClose: EventEmitter<boolean> = new EventEmitter();

  // Event notifing about the connection
  onOpen: EventEmitter<boolean> = new EventEmitter();

  isOpen: boolean = false;

  constructor() {}

  open() {
    const self = this;

    this.ws = new WebSocket(`ws://localhost:8080`);
    // this.ws = new WebSocket(`ws://${location.host}/stream/`);

    this.ws.onerror = function () {
      console.log('WebSocket error');
    };

    this.ws.onopen = function () {
      self.isOpen = true;
      self.onOpen.emit(true);
      console.log('WebSocket connection established');
    };

    this.ws.onclose = function () {
      self.onClose.emit(true);
      self.isOpen = false;
      console.log('WebSocket connection closed');
    };

    this.ws.onmessage = function (msg: any) {
      const mes = JSON.parse(msg.data);
      if (mes['status'] == 0) {
        self.onAnotherUserConneted.emit(true);
      } else if (mes['status'] == 1) {
        self.onMessage.emit(mes['data'] as Message);
      } else if (mes['status'] == 2) {
        self.onAnotherUserConneted.emit(true);
      }

      console.log('WebSocket message', msg.data);
    };
  }
}
