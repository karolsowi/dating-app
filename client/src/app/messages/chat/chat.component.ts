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

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(filter(Boolean), take(1)).subscribe(async (user) => {
      this.currentUser = user;
      await this.loadConversations();

      const userId = this.route.snapshot.paramMap.get('userId');
      if (!userId) {
        if (this.conversations.length === 0) return;

        this.openChat(this.conversations[0].userId);
        return;
      }

      this.initChat(userId);
    });

    setInterval(() => {
      if (this.otherUser) {
        this.loadMessages(this.otherUser.id);
      }
      this.loadConversations();
    }, 5000);

    this.route.paramMap.subscribe((params) => {
      const newUserId = params.get('userId');
      if (!newUserId) return;
      this.initChat(newUserId);
    });
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
    } catch (err) {}
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
    if (!this.newMessage.trim()) return;

    this.chatService.sendMessage(this.otherUser.id, this.newMessage).subscribe((msg) => {
      this.messages.push(msg);
      this.newMessage = '';
      this.shouldScroll = true;
    });
    this.cdr.detectChanges();
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
}
