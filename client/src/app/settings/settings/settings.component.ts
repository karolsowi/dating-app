import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
    profileForm: FormGroup;
    user: any;
    successMessage = '';

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private authService: AuthService
    ) {
        this.profileForm = this.fb.group({
            name: ['', Validators.required],
            age: ['', [Validators.required, Validators.min(18)]],
            gender: ['', Validators.required],
            lookingFor: ['', Validators.required],
            bio: [''],
            profilePic: ['']
        });
    }

    ngOnInit(): void {
        this.user = this.authService.currentUserValue;
        if (this.user) {
            this.userService.getUser(this.user.id).subscribe(userData => {
                this.profileForm.patchValue(userData);
            });
        }
    }

    onSubmit() {
        if (this.profileForm.invalid) return;

        this.userService.updateProfile(this.user.id, this.profileForm.value).subscribe({
            next: (updatedUser) => {
                this.successMessage = 'Profile updated successfully!';
                // Update local storage user data implicitly via auth service login mechanism or manual update if needed
                // For simplicity, just showing success
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: (err) => console.error('Error updating profile', err)
        });
    }
}
