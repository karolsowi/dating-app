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

    // Badges configuration
    availableBadges = [
        { id: 1, text: 'New friends', emoji: '👋', class: 'badge-new-friends' },
        { id: 2, text: 'Short-term', emoji: '🎉', class: 'badge-short-term' },
        { id: 3, text: 'Long-term', emoji: '💗', class: 'badge-long-term' }
    ];

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        public authService: AuthService
    ) {
        this.profileForm = this.fb.group({
            bio: [''],
            lookingFor: [[]], // Array of badge IDs
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            dob: ['', Validators.required],
            userGender: ['man', Validators.required],
            partnerGender: [['woman'], Validators.required] // Array for multiple selection if needed, or single
        });
    }

    ngOnInit(): void {
        this.user = this.authService.currentUserValue;
        if (this.user) {
            this.userService.getUser(this.user.id).subscribe(userData => {
                this.profileForm.patchValue({
                    bio: userData.bio,
                    lookingFor: userData.badgeIds || [],
                    name: userData.name,
                    email: userData.email,
                    dob: userData.dob,
                    userGender: userData.userGender || 'man',
                    partnerGender: userData.partnerGender || ['woman']
                });
            });
        }
    }

    toggleBadge(badgeId: number) {
        const currentBadges = this.profileForm.get('lookingFor')?.value || [];
        const index = currentBadges.indexOf(badgeId);

        if (index === -1) {
            currentBadges.push(badgeId);
        } else {
            currentBadges.splice(index, 1);
        }

        this.profileForm.patchValue({ lookingFor: currentBadges });
        this.profileForm.markAsDirty();
    }

    isBadgeSelected(badgeId: number): boolean {
        return (this.profileForm.get('lookingFor')?.value || []).includes(badgeId);
    }

    onGenderChange(event: any) {
        // Logic if we need to enforce rules, for now just reactive form
    }

    onPartnerGenderChange(event: any) {
        // Logic if we need to enforce rules
        // The mock shows a dropdown with "Women x", implying a multi-select or specific UI component
        // For MVP we can stick to simple native select or custom if requested. 
        // Given the requirement "like in image", the image shows a native-ish select with a tag inside.
        // We'll approximate this with a standard select for now or a custom UI.
        // Let's use a standard multi-select or single select for simplicity unless specified.
        // The image shows "interested in [Women x] v", which looks like a multi-select.

        // However, standard HTML select multiple is ugly. 
        // I will implement a simple native select for 'Interested in' for now, 
        // but note that the mock implies removal (x).
    }

    onChangePassword() {
        alert('Change password functionality would open a modal here.');
    }

    onLogout() {
        this.authService.logout();
    }

    addPhoto(url: string) {
        if (!url) return;
        const currentPics = this.user.pictures || [];
        // Ideally we update the form or local user state immediately
        // For now, simpler to just push to user object locally and let submit handle sync if we were binding to form
        // But wait, the form doesn't have 'pictures' control.
        // We should add it or just handle it separately.
        // Let's bind it to a form control to be consistent.
        // I didn't add 'pictures' to the form group yet.
        // Actually, let's just update the local user object and send it on save.
        // Better: add to form.
        this.user.pictures = [...currentPics, url];
        this.profileForm.markAsDirty();
    }

    removePhoto(index: number) {
        if (!this.user.pictures) return;
        this.user.pictures.splice(index, 1);
        this.profileForm.markAsDirty();
    }

    onSubmit() {
        if (this.profileForm.invalid) return;

        const formValue = this.profileForm.value;
        const updates = {
            ...formValue,
            badgeIds: formValue.lookingFor, // Map form control to API field
            pictures: this.user.pictures // Include pictures in update
        };

        this.userService.updateProfile(this.user.id, updates).subscribe({
            next: (updatedUser) => {
                this.successMessage = 'Profile updated successfully!';
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: (err) => console.error('Error updating profile', err)
        });
    }
}
