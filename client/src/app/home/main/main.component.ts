import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../services/user.service';
import { MatchService } from '../../services/match.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
    selector: 'app-main',
    standalone: true,
    imports: [CommonModule, NavbarComponent],
    templateUrl: './main.component.html',
    styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {
    users: any[] = [];
    currentIndex = 0;
    matchMessage = '';
    isLoading = false;

    constructor(
        private userService: UserService,
        private matchService: MatchService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

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

        this.isLoading = true;
        this.cdr.detectChanges(); // Force update helper
        this.userService.getUsers().subscribe({
            next: (users) => {
                this.users = users;
                this.isLoading = false;
                console.log('MainComponent loaded users:', users.length);
                this.cdr.detectChanges(); // Ensure UI updates
            },
            error: (err) => {
                console.error('Failed to load users', err);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    get currentUser() {
        return this.users[this.currentIndex];
    }

    like() {
        if (!this.currentUser) return;

        this.matchService.likeUser(this.currentUser.id).subscribe((res: any) => {
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
}
