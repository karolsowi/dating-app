import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserService } from '../services/user.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
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
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
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
      next: (user) => {
        console.log('User data loaded:', user);
        try {
          if (!user) {
            throw new Error('User data is null');
          }
          this.user = user;

          // Use minifiedPictures from server which contains real like stats
          if (user.minifiedPictures && user.minifiedPictures.length > 0) {
            this.displayPhotos = user.minifiedPictures.map((item: any) => ({
              url: item.url,
              likes: item.likes || 0,
              isLiked: item.isLiked || false,
              comments: Math.floor(Math.random() * 10), // Comments still mock for now
              description: 'Photo description...'
            }));
          } else {
            // Fallback if no specific stats (should not happen with new backend)
            this.displayPhotos = (user.pictures || []).map((url: string) => ({
              url: url,
              likes: 0,
              isLiked: false,
              comments: 0,
              description: 'Photo description...'
            }));
          }

          // Ensure we have at least 4 placeholders if fewer photos exist (to match grid)
          while (this.displayPhotos.length < 4) {
            this.displayPhotos.push({
              url: null, // Placeholder
              likes: 0,
              isLiked: false,
              comments: 0
            });
          }

          this.loading = false;
          console.log('Profile setup complete. Loading = false');
          this.cdr.detectChanges(); // Force update view

        } catch (e) {
          console.error('Error in loadUser processing:', e);
          this.error = 'Error processing user data';
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
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
      next: (response) => {
        console.log('Like toggled:', response);
        // Sync with server response to be sure
        photo.likes = response.count;
        photo.isLiked = response.isLiked;
        this.cdr.detectChanges();
      },
      error: (err) => {
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
