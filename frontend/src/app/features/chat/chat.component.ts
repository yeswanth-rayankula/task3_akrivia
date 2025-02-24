// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { io, Socket } from 'socket.io-client';
// import { NavbarService } from '../navbar/navbar.service';

// interface User {
//   user_id: number;
//   username: string;
//   profile_pic: string;
// }

// interface Message {
//   sender_id: number;
//   message: string;
//   created_at?: Date;
// }

// @Component({
//   selector: 'app-chat',
//   templateUrl: './chat.component.html',
//   styleUrls: ['./chat.component.scss']
// })
// export class ChatComponent implements OnInit, OnDestroy {
//   users: User[] = [];
//   selectedUser: User | null = null;
//   messages: Message[] = [];
//   socket: Socket;
//   currentUserId:number=0;  
//   unreadMessages: { [key: number]: number } = {}; 

//   constructor(private http: HttpClient, private navbarService: NavbarService) {
//     this.socket = io('http://localhost:4000');
//   }

//   ngOnInit() {
//     this.fetchUsers();
//     this.navbarService.getUserById()
//       .subscribe((data) => {
//         this.currentUserId = data.user_id;
//         console.log("Current User: ", data);
//       });

//     this.socket.on('connect', () => {
//       console.log('Connected to socket server');
//     });

//     this.socket.on('receiveMessage', (data: Message) => {
//       console.log('✅ Message received:', data);

//       if (this.selectedUser && data.sender_id === this.selectedUser.user_id) {
//         this.messages.push(data);  // Push message to the current chat
//       } else {
//         this.unreadMessages[data.sender_id] = (this.unreadMessages[data.sender_id] || 0) + 1;  // Update unread message count
//       }
//     });
//   }

//   fetchUsers() {
//     this.http.get<User[]>('http://localhost:4000/api/v1/user/getAllData')
//       .subscribe(
//         data => this.users = data,
//         error => console.error('Error fetching users:', error)
//       );
//   }

//   openChat(user: User) {
//     this.selectedUser = user;
//     this.messages = [];  // Clear existing messages in the chat
//     this.unreadMessages[user.user_id] = 0;  // Reset unread messages count

//     this.socket.emit('joinChat', this.currentUserId);  // Join the chat room for this user

//     console.log(`Joined chat with user ${user.username}`);

//     this.http
//       .get<Message[]>(`http://localhost:4000/api/v1/user/chat-history/${this.currentUserId}/${user.user_id}`)
//       .subscribe(
//         (data) => {
//           this.messages = data;  // Load chat history
//         },
//         (error) => console.error('Error fetching chat history:', error)
//       );
//   }

//   sendMessage(message: string) {
//     if (!this.selectedUser || !message.trim()) return;

//     const newMessage: Message = {
//       sender_id: this.currentUserId,
//       message,
//       created_at: new Date()
//     };

//     this.messages.push(newMessage);  // Add the new message instantly to the chat window

//     this.socket.emit('sendMessage', {
//       sender_id: this.currentUserId,
//       receiver_id: this.selectedUser.user_id,
//       message
//     });

//     console.log(`📨 Sent message: ${message} to ${this.selectedUser.username}`);
//   }

//   ngOnDestroy() {
//     this.socket.disconnect();
//     console.log('Socket disconnected');
//   }
// }

import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SocketService } from './../../core/services/socket.service';
import { NavbarService } from '../navbar/navbar.service';
import { CheckService } from 'src/app/check/check.service';
import { log } from 'console';

interface User {
  user_id: number;
  username: string;
  profile_pic: string;
}

interface Message {
  sender_id: number;
  message: string;
  created_at?: Date;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  users: User[] = [];
  selectedUser: User | null = null;
  messages: Message[] = [];
  currentUserId: number = 0;
  unreadMessages: { [key: number]: number } = {}; 
  currentUser:any;
  constructor(
    private http: HttpClient, 
    private navbarService: NavbarService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
  
    this.fetchUsers();
    
    this.navbarService.getUserById().subscribe(data => {
      this.currentUserId = data.user_id;
      this.currentUser=data;
      console.log("Current User: ", data);
    });

    this.socketService.receiveMessage().subscribe((data: Message) => {
      console.log('✅ Message received:', data);

      if (this.selectedUser && data.sender_id === this.selectedUser.user_id) {
        this.messages.push(data);  
      } else {
        this.unreadMessages[data.sender_id] = (this.unreadMessages[data.sender_id] || 0) + 1;
      }
    });
  }

  fetchUsers() {
    this.http.get<User[]>('http://localhost:4000/api/v1/user/getAllData')
      .subscribe(
        data => this.users =  data.filter(user => user.user_id !== this.currentUserId),
        error => console.error('Error fetching users:', error)
      );
  }

  openChat(user: User) {
    this.selectedUser = user;
    this.messages = [];
    this.unreadMessages[user.user_id] = 0;  

    this.socketService.joinChat(this.currentUserId);

    console.log(`Joined chat with user ${user.username}`);

    this.http.get<Message[]>(`http://localhost:4000/api/v1/user/chat-history/${this.currentUserId}/${user.user_id}`)
      .subscribe(
        data => this.messages = data,
        error => console.error('Error fetching chat history:', error)
      );
  }

  sendMessage(message: string) {
    if (!this.selectedUser || !message.trim()) return;

    const newMessage: Message = {
      sender_id: this.currentUserId,
      message,
      created_at: new Date()
    };

    this.messages.push(newMessage);  

    this.socketService.sendMessage(this.currentUserId, this.selectedUser.user_id, message);

    console.log(`📨 Sent message: ${message} to ${this.selectedUser.username}`);
  }

  ngOnDestroy() {
    this.socketService.disconnect();
    console.log('Socket disconnected');
  }
}
