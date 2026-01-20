import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css'
})
export class EditProfileComponent implements OnInit {
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
      partnerGender: [['woman'], Validators.required]
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

  onChangePassword() {
    alert('Change password functionality would open a modal here.');
  }

  addPhoto(url: string) {
    if (!url) return;
    const currentPics = this.user.pictures || [];
    // Update local object immediately for UI feedback
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
      badgeIds: formValue.lookingFor,
      pictures: this.user.pictures
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
