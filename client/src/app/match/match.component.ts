import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { MatchModal } from '../match-modal/match-modal';
import { UserService } from '../services/user.service';
import { MatchService } from '../services/match.service';
import { AuthService } from '../services/auth.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [CommonModule, NavbarComponent, MatchModal],
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss'],
  animations: [
    trigger('userTransition', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateY(40px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class MatchComponent implements OnInit {
  user: any;
  loading = true;
  error: string | null = null;
  users: any[] = [];
  displayedIndex = 0;
  displayedPictureIndex = 0;
  isProcessingAction = false;
  showMatchModal = false;
  matchedUser: any = null;

  constructor(
    private userService: UserService,
    private matchService: MatchService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(
        filter((user) => !!user),
        take(1),
      )
      .subscribe(() => {
        this.loadUsers();
      });
  }

  loadUsers() {
    // Ensure we have a valid current user before fetching
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.warn('No legitimate current user found in UserService, skipping fetch.');
      return;
    }

    this.displayedIndex = 0;
    this.loading = true;
    this.error = null;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        this.displayedIndex = 0;
        this.displayedPictureIndex = 0; // Reset picture index
        console.log('Loaded users:', this.users);
        console.log('Current displayedUser:', this.displayedUser);
        this.cdr.detectChanges(); // Force change detection
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.error = 'Failed to load user data.';
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection
      },
    });
  }

  get displayedUser() {
    return this.hasMoreUsers ? this.users[this.displayedIndex] : null;
  }

  get hasMoreUsers(): boolean {
    return this.displayedIndex < this.users.length;
  }

  like() {
    console.log('Like button clicked');
    if (!this.displayedUser || this.isProcessingAction) {
      console.log('Cannot like: no user or already processing', { displayedUser: !!this.displayedUser, isProcessing: this.isProcessingAction });
      return;
    }

    const userToLike = this.displayedUser; // Capture the current user
    this.isProcessingAction = true;

    this.matchService.likeUser(userToLike.id).subscribe({
      next: (res: any) => {
        console.log('Like response:', res);
        if (res.match) {
          this.matchedUser = userToLike;
          this.showMatchModal = true;
        } else {
          this.nextUser();
        }
        this.isProcessingAction = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Like failed:', err);
        this.isProcessingAction = false;
        this.cdr.detectChanges(); // Ensure buttons are re-enabled
      }
    });
  }

  dislike() {
    console.log('Dislike button clicked');
    if (!this.displayedUser || this.isProcessingAction) {
      console.log('Cannot dislike: no user or already processing', { displayedUser: !!this.displayedUser, isProcessing: this.isProcessingAction });
      return;
    }

    const userToDislike = this.displayedUser; // Capture the current user
    this.isProcessingAction = true;

    this.matchService.passUser(userToDislike.id).subscribe({
      next: (res: any) => {
        console.log('Dislike response:', res);
        this.nextUser();
        this.isProcessingAction = false;
        this.cdr.detectChanges(); // Ensure buttons are re-enabled
      },
      error: (err) => {
        console.error('Dislike failed:', err);
        this.isProcessingAction = false;
        this.cdr.detectChanges(); // Ensure buttons are re-enabled
      }
    });
  }

  nextUser() {
    if (this.displayedIndex >= this.users.length) {
      console.log('No more users to show');
      return;
    }

    this.displayedIndex++;
    this.displayedPictureIndex = 0;
    this.cdr.detectChanges(); // Force change detection to update the UI
  }

  nextPicture(event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    console.log('Next picture clicked');
    if (
      this.displayedUser?.pictures &&
      this.displayedPictureIndex < this.displayedUser.pictures.length - 1
    ) {
      this.displayedPictureIndex++;
      this.cdr.detectChanges();
    }
  }

  prevPicture(event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    console.log('Prev picture clicked');
    if (this.displayedPictureIndex > 0) {
      this.displayedPictureIndex--;
      this.cdr.detectChanges();
    }
  }

  onContinueMatching() {
    this.nextUser();
  }

  onGoToChat(matchedUser: any) {
    // Navigate to chat page with the matched user
    if (!matchedUser) {
      console.error('onGoToChat called with null matchedUser');
      if (this.matchedUser) {
        matchedUser = this.matchedUser;
      } else {
        return;
      }
    }
    this.router.navigate([`/messages/${matchedUser.id}`]);
  }

  getBadgeInfo(id: number): { text: string; emoji: string } {
    switch (id) {
      case 1:
        return { text: 'New friends', emoji: '👋' };
      case 2:
        return { text: 'Short-term', emoji: '🎉' };
      case 3:
        return { text: 'Long-term', emoji: '💗' };
      default:
        return { text: '', emoji: '' };
    }
  }

  get userAge(): number | null {
    if (!this.displayedUser?.dob) return null;
    return this.calculateAge(this.displayedUser.dob);
  }

  private calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
