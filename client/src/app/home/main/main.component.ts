import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { PromoFooterComponent } from '../../shared/promo-footer/promo-footer.component';

@Component({
    selector: 'app-main',
    standalone: true,
    imports: [CommonModule, NavbarComponent, PromoFooterComponent],
    templateUrl: './main.component.html',
    styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {
    recentMatches: any[] = [];
    isLoading = false;
    user: any;

    constructor(
        private matchService: MatchService,
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.user = this.authService.currentUserValue;
        console.log('MainComponent Init. User:', this.user);
        if (this.user) {
            this.loadRecentMatches();
        } else {
            // Fallback: Subscribe if not available immediately (e.g., page refresh race condition)
            this.authService.currentUser$.subscribe(u => {
                console.log('MainComponent Subscription Update. User:', u);
                if (u) {
                    this.user = u;
                    this.loadRecentMatches();
                }
            });
        }
    }

    loadRecentMatches() {
        this.isLoading = true;
        this.cdr.detectChanges(); // Update UI to show loading state if needed
        this.matchService.getMatches().subscribe({
            next: (matches) => {
                console.log('Matches loaded:', matches);
                // Take the last 3 matches and reverse them to show newest first
                this.recentMatches = matches.slice(-3).reverse();
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load matches', err);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    navigateToMatch() {
        this.router.navigate(['/match']);
    }

    openChat(userId: string) {
        this.router.navigate(['/messages', userId]);
    }

    viewProfile(userId: string) {
        this.router.navigate(['/profile', userId]);
    }

    getProfileImage(user: any): string {
        if (user.pictures && user.pictures.length > 0) {
            return user.pictures[0];
        }
        if (user.profilePic) {
            return user.profilePic;
        }
        return 'https://via.placeholder.com/200x200?text=User';
    }

    getUserAge(user: any): number | string {
        if (user.age) {
            return user.age;
        }
        if (user.dob) {
            return this.calculateAge(user.dob);
        }
        return '?';
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
