import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { PromoFooterComponent } from '../../shared/promo-footer/promo-footer.component';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, NavbarComponent, PromoFooterComponent, RouterModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
    constructor(public authService: AuthService) { }

    ngOnInit(): void {
    }

    onLogout() {
        this.authService.logout();
    }
}
