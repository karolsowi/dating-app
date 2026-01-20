import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  animations: [
    trigger('transition', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  messages: any[] = [];
  newMessage = '';
  otherUser: any;
  currentUser: any;
  shouldScroll = false;
  chatReady = false;
  conversations: any[] = [];
  initialId: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    // Get the user once
    this.authService.currentUser$.pipe(filter(Boolean), take(1)).subscribe(async (user) => {
      this.currentUser = user;
      await this.loadConversations();

      // Check if we are at the base path /messages without an ID
      this.initialId = this.route.snapshot.paramMap.get('userId');
      if (!this.initialId && this.conversations.length > 0) {
        this.openChat(this.conversations[0].userId);
      }
    });

    // Find which chat is open
    this.route.paramMap.subscribe((params) => {
      const userId = params.get('userId');
      if (userId) {
        this.prepareNewChat(); // Clear old data first
        this.initChat(userId);
      }
    });

    // Poll for new messages every 5 seconds
    setInterval(() => {
      if (this.otherUser) {
        this.loadMessages(this.otherUser.id);
      }
      this.loadConversations();
    }, 5000);
  }

  // Helper to prevent "flickering" or showing old messages while loading new ones
  private prepareNewChat() {
    this.messages = [];
    this.otherUser = null;
    this.chatReady = false;
  }

  private initChat(userId: string) {
    this.userService.getUser(userId).subscribe((user) => {
      this.otherUser = user;
      this.chatReady = true;
      this.cdr.detectChanges();
    });

    this.loadMessages(userId);
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop =
        this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  loadMessages(otherUserId: string) {
    this.chatService.getMessages(otherUserId).subscribe((messages) => {
      this.messages = messages;
      this.shouldScroll = true;
      this.cdr.detectChanges();
    });
  }

  loadConversations(): Promise<void> {
    return new Promise((resolve) => {
      this.chatService.getConversations().subscribe((convos) => {
        this.conversations = convos;
        this.cdr.detectChanges();
        resolve();
      });
    });
  }

  sendMessage() {
    const content = this.newMessage.trim();
    if (!content || !this.otherUser) return;

    // 1. Create a temporary local message object
    const tempMessage = {
      content: content,
      fromUserId: this.currentUser.id,
      timestamp: new Date(), // Local time for instant feedback
      isSending: true, // Optional: you can use this to show a "sending..." style
    };

    // 2. Update UI instantly
    this.messages.push(tempMessage);
    this.newMessage = ''; // Clear input immediately
    this.shouldScroll = true;
    this.cdr.detectChanges();

    // 3. Send to backend in the background
    this.chatService.sendMessage(this.otherUser.id, content).subscribe({
      next: (actualMsg) => {
        // Replace the temp message with the real one from the server (which has the real ID)
        const index = this.messages.indexOf(tempMessage);
        if (index !== -1) {
          this.messages[index] = actualMsg;
        }
      },
      error: (err) => {
        // Optional: Remove the message or show an error if sending fails
        this.messages = this.messages.filter((m) => m !== tempMessage);
        alert('Message failed to send.');
      },
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  openChat(otherUserId: string) {
    this.router.navigate(['/messages', otherUserId]);
  }

  viewProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}
