import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, FormsModule, NavbarComponent],
    templateUrl: './chat.component.html',
    styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, AfterViewChecked {
    @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

    messages: any[] = [];
    newMessage = '';
    otherUser: any;
    currentUser: any;

    constructor(
        private route: ActivatedRoute,
        private chatService: ChatService,
        private userService: UserService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.currentUser = this.authService.currentUserValue;
        const userId = this.route.snapshot.paramMap.get('userId');

        if (userId) {
            this.userService.getUser(userId).subscribe(user => {
                this.otherUser = user;
            });

            this.loadMessages(userId);

            // Simple polling for new messages (every 5 seconds)
            // In production, use WebSockets (Socket.io)
            setInterval(() => {
                this.loadMessages(userId);
            }, 5000);
        }
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }

    loadMessages(otherUserId: string) {
        this.chatService.getMessages(otherUserId).subscribe(messages => {
            this.messages = messages;
        });
    }

    sendMessage() {
        if (!this.newMessage.trim() || !this.otherUser) return;

        this.chatService.sendMessage(this.otherUser.id, this.newMessage).subscribe(msg => {
            this.messages.push(msg);
            this.newMessage = '';
            this.scrollToBottom();
        });
    }
}
