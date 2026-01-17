import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { UserService } from '../services/user.service';
import { MatchService } from '../services/match.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit {
  user: any;
  loading = true;
  error: string | null = null;
  users: any[] = [];
  currentIndex = 0;
  matchMessage = '';
  isLoading = false;

  constructor(
    private userService: UserService,
    private matchService: MatchService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: any) => {
      if (user) {
        this.loadUsers();
      }
    });
  }

  loadUsers() {
    // Ensure we have a valid current user before fetching
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.warn('No legitimate current user found in UserService, skipping fetch.');
      return;
    }

    this.loading = true;
    this.error = null;
    this.cdr.detectChanges(); // Force update helper
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        console.log('Loaded users:', users);
        // No need to set this.user here, use currentUser getter
        this.cdr.detectChanges(); // Ensure UI updates
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.error = 'Failed to load user data.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get currentUser() {
    return this.users[this.currentIndex];
  }

  like() {
    if (!this.currentUser) return;

    this.matchService.likeUser(this.currentUser.id).subscribe((res: any) => {
      console.log('Like response:', res);
      if (res.match) {
        this.matchMessage = `It's a Match! You matched with ${this.currentUser.name}`;
        setTimeout(() => this.matchMessage = '', 3000);
      }
      this.nextUser();
    });
  }

  dislike() {
    if (!this.currentUser) return;

    this.matchService.passUser(this.currentUser.id).subscribe(() => {
      this.nextUser();
    });
  }

  nextUser() {
    this.currentIndex++;
    this.cdr.detectChanges();
  }

  get userAge(): number | null {
    if (!this.currentUser?.dob) return null;
    return this.calculateAge(this.currentUser.dob);
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
