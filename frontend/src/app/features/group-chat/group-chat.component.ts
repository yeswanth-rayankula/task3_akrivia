import { Component, OnInit } from '@angular/core';
import { SocketService } from 'src/app/core/services/socket.service';
import { NavbarService } from '../navbar/navbar.service';

@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.scss']
})
export class GroupChatComponent implements OnInit {
 
  showChat = false;
  teamId = '';
  message = '';
  messages: { sender: string, text: string }[] = [];

  constructor(private socketService: SocketService,private navbarService:NavbarService) {}

  createTeam() {
    this.teamId = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.showChat = true;
    this.socketService.joinTeam(this.teamId);
  }

  joinTeam() {
    if (this.teamId.trim()) {
      this.showChat = true;
      this.socketService.joinTeam(this.teamId);
    }
  }

  sendGroupMessage() {
    if (this.message.trim()) {
      this.socketService.sendGroupMessage(this.teamId, this.username, this.message);
      this.message = '';
    }
  }
  username:any;
  ngOnInit() {
    this.navbarService.getUserById().subscribe(data => {
      this.username=data.username;
      console.log("Current User: ", data);
    });
    this.socketService.receiveGroupMessages().subscribe((msg) => {
      console.log(msg);
      this.messages.push(msg);
    });
  }
  modal:boolean=false;
  toggleModal()
  {
    this.modal=!this.modal;
  }
  goBack() {
    this.showChat = false;
  }
  leaveGroupMessage()
  {
    this.teamId = '';
    this.showChat = false;
 

    this.messages = [];
    console.log('Left the group chat.');
  }
  closeModal()
  {
    this.modal=!this.modal;
  }

}




