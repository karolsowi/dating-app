import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserService } from '../services/user.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { PromoFooterComponent } from '../shared/promo-footer/promo-footer.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, PromoFooterComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  user: any;
  loading = true;
  error: string | null = null;
  private currentUserId: string | null = null;

  // Enhanced photo object structure for display
  displayPhotos: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  get isOwnProfile(): boolean {
    const loggedInId = this.authService.currentUserValue?.id;
    return loggedInId === this.user?.id;
  }

  // Badges configuration (duplicated from EditProfile, ideally shared service/const)
  availableBadges = [
    { id: 1, text: 'New friends', emoji: '👋', class: 'badge-new-friends' },
    { id: 2, text: 'Short-term', emoji: '🎉', class: 'badge-short-term' },
    { id: 3, text: 'Long-term', emoji: '💗', class: 'badge-long-term' }
  ];

  getBadge(id: number) {
    return this.availableBadges.find(b => b.id === id);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: any) => {
      const userId = params.get('id');
      console.log('Profile params changed, ID:', userId);

      if (userId) {
        // Strict check: if it's the same user ID we've already processed, ignore.
        if (this.currentUserId === userId) {
          console.log('Ignored duplicate param update for:', userId);
          return;
        }
        this.currentUserId = userId;
        this.loading = true;
        this.error = null;
        this.cdr.detectChanges(); // Force spinner show

        console.log('Loading user:', userId);
        this.loadUser(userId);
      } else {
        console.warn('No user ID in params');
        this.error = 'User not found';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadUser(id: string) {
    this.userService.getUser(id).subscribe({
      next: (user: any) => {
        console.log('User data loaded:', user);
        try {
          if (!user) {
            throw new Error('User data is null');
          }
          this.user = user;

          // Determine main profile pic (fallback to first picture if profilePic is missing/broken)
          const mainProfilePic = user.profilePic || (user.pictures && user.pictures.length > 0 ? user.pictures[0] : null);
          this.user.displayProfilePic = mainProfilePic;

          console.log('Main Profile Pic:', mainProfilePic);
          console.log('User Pictures:', user.pictures);
          console.log('Minified Pictures:', user.minifiedPictures);

          // Filter out profile pic from minifiedPictures
          let rawPhotos = user.minifiedPictures || [];
          if (rawPhotos.length === 0 && user.pictures) {
            rawPhotos = user.pictures.map((url: string) => ({ url, likes: 0, isLiked: false }));
          }

          // Filter logic: exclude the main displayed picture
          const filteredPhotos = rawPhotos.filter((p: any) => p.url !== mainProfilePic);
          console.log('Filtered Photos:', filteredPhotos);

          this.displayPhotos = filteredPhotos.map((item: any) => ({
            ...item,
            // comments removed as per request
            // description: 'Photo description...' // preserved if needed, or remove? keeping basic struct
          }));

          // Fill grid to at least 4 or 6? User said "grid". 
          // Let's stick to matching EditProfile grid size or similar. 
          // If public profile, we just show what exists, maybe no placeholders if empty?
          // "it should not show empty placeholder images" -> implied for edit maybe? 
          // "pictures on right side" -> public view. 
          // The user said "it should not show empty placeholder images, instead show + icon after the last image" -> this was likely for EDIT mode.
          // For public mode, we just show the photos.

          this.loading = false;
          console.log('Profile setup complete. Loading = false');
          this.cdr.detectChanges();

        } catch (e) {
          console.error('Error in loadUser processing:', e);
          this.error = 'Error processing user data';
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        console.error('Failed to load user API:', err);
        this.error = 'Failed to load user profile.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get age(): number | null {
    if (!this.user?.dob) return null;
    return this.calculateAge(this.user.dob);
  }

  private calculateAge(dob: string): number {
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (e) {
      return 20; // fallback
    }
  }

  // Interaction handlers
  onEditPhoto(index: number) {
    if (!this.displayPhotos[index].url) return;
    const action = prompt(`Edit photo ${index + 1}:\nType 'delete' to remove or enter new description:`, this.displayPhotos[index].description);
    if (action === 'delete') {
      // In real app, call API to remove
      alert('Photo removed (mock)');
      this.displayPhotos[index].url = null;
    } else if (action && action.trim() !== '') {
      alert(`Description updated: ${action}`);
      this.displayPhotos[index].description = action;
    }
  }

  onShowComments(index: number) {
    if (!this.displayPhotos[index].url) return;
    alert(`Comments for photo ${index + 1}:\n- Nice pic!\n- Looking good!\n(Total: ${this.displayPhotos[index].comments})`);
  }

  onLikePhoto(index: number) {
    const photo = this.displayPhotos[index];
    if (!photo.url) return;

    // Optimistic Update
    const originalLikes = photo.likes;
    const originalIsLiked = photo.isLiked;

    photo.isLiked = !photo.isLiked;
    photo.likes += photo.isLiked ? 1 : -1;
    this.cdr.detectChanges(); // Update UI immediately

    this.userService.togglePhotoLike(photo.url).subscribe({
      next: (response: any) => {
        console.log('Like toggled:', response);
        // Sync with server response to be sure
        photo.likes = response.count;
        photo.isLiked = response.isLiked;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Like failed', err);
        // Revert on error
        photo.likes = originalLikes;
        photo.isLiked = originalIsLiked;
        this.cdr.detectChanges();
        alert('Failed to update like');
      }
    });
  }
}
