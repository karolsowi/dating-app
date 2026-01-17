import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-match-modal',
  imports: [CommonModule],
  templateUrl: './match-modal.html',
  styleUrl: './match-modal.css',
})
export class MatchModal {
  @Input() matchedUser: any;
  @Input() isVisible = false;
  @Output() continueMatching = new EventEmitter<void>();
  @Output() goToChat = new EventEmitter<any>();

  onContinue() {
    this.isVisible = false;
    this.continueMatching.emit();
  }

  onGoToChat() {
    this.isVisible = false;
    this.goToChat.emit(this.matchedUser);
  }
}
