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
        this.user = { ...userData, pictures: userData.pictures || [] }; // Ensure pictures array exists
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



  removePhoto(gridIndex: number) {
    if (!this.user.pictures) return;

    // gridItems stores the URL. Find it in the real array.
    const urlToRemove = this.galleryPhotos[gridIndex];
    const realIndex = this.user.pictures.indexOf(urlToRemove);

    if (realIndex > -1) {
      this.user.pictures.splice(realIndex, 1);
      this.profileForm.markAsDirty();
    }
  }

  get displayProfilePic(): string | null {
    if (!this.user) return null;
    return this.user.profilePic || (this.user.pictures && this.user.pictures.length > 0 ? this.user.pictures[0] : null);
  }

  get galleryPhotos(): string[] {
    if (!this.user || !this.user.pictures) return [];
    // meaningful filter: exclude duplicate of displayed profile pic
    const mainPic = this.displayProfilePic;
    return this.user.pictures.filter((p: string) => p !== mainPic);
  }

  // We want a fixed grid of 6 slots
  get gridItems(): any[] {
    const photos = this.galleryPhotos;
    const items = [];
    for (let i = 0; i < 6; i++) {
      if (i < photos.length) {
        items.push({ type: 'photo', url: photos[i], index: i });
      } else if (i === photos.length) {
        items.push({ type: 'add' });
      } else {
        items.push({ type: 'empty' });
      }
    }
    return items;
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    const formValue = this.profileForm.value;
    const updates = {
      ...formValue,
      badgeIds: formValue.lookingFor,
      pictures: this.user.pictures // Start with existing pictures
      // Note: We aren't explicitly saving profilePic separate from pictures list logic here
      // But typically profilePic is handled via a separate upload or selection.
      // For this task, we assume profilePic logic is handled elsewhere or via standard form binding if it was an input.
      // (The user didn't ask to change how profilePic is SET, just displayed).
    };

    this.userService.updateProfile(this.user.id, updates).subscribe({
      next: (updatedUser) => {
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => console.error('Error updating profile', err)
    });
  }

  // Override addPhoto to ensure we don't add duplicates
  addPhoto(url: string) {
    if (!url) return;
    if (!this.user.pictures) this.user.pictures = [];
    if (this.user.pictures.includes(url)) return;

    this.user.pictures.push(url);
    this.profileForm.markAsDirty();
  }

  triggerAddPhoto() {
    const url = prompt('Enter image URL:');
    if (url) {
      this.addPhoto(url);
    }
  }

  changeProfilePic() {
    const url = prompt('Enter new profile picture URL:', this.user.profilePic);
    if (url && url !== this.user.profilePic) {
      this.user.profilePic = url;
      this.profileForm.markAsDirty();
    }
  }
}
