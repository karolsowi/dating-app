import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { MatchService } from '../../services/match.service';
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

    constructor(private userService: UserService, private matchService: MatchService) { }

    ngOnInit(): void {
        this.userService.getUsers().subscribe(users => {
            this.users = users;
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
        this.nextUser();
    }

    nextUser() {
        this.currentIndex++;
    }
}
