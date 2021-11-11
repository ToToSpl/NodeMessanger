export class Message {
  message_to_user_id: number;
  message_text: string;

  constructor(message_to_user_id: number, message_text: string) {
    this.message_to_user_id = message_to_user_id;
    this.message_text = message_text;
  }
}
