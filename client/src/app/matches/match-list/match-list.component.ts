import { Component, OnInit } from '@angular/core';
import { MatchService } from '../../services/match.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
    selector: 'app-match-list',
    standalone: true,
    imports: [CommonModule, RouterModule, NavbarComponent],
    templateUrl: './match-list.component.html',
    styleUrl: './match-list.component.css'
})
export class MatchListComponent implements OnInit {
    matches: any[] = [];

    constructor(private matchService: MatchService) { }

    ngOnInit(): void {
        this.matchService.getMatches().subscribe(matches => {
            this.matches = matches;
        });
    }
}
