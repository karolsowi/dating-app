import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-promo-footer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './promo-footer.component.html',
    styleUrl: './promo-footer.component.css'
})
export class PromoFooterComponent implements OnInit, OnDestroy {
    timeLeft: string = '';
    private timerId: any;

    constructor(private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.startCountdown();
    }

    ngOnDestroy(): void {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
    }

    startCountdown() {
        const calculateTimeLeft = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0); // Next midnight

            const diff = midnight.getTime() - now.getTime();
            if (diff <= 0) {
                this.timeLeft = '00:00:00';
                return;
            }

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            this.timeLeft = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
            this.cdr.detectChanges();
        };

        calculateTimeLeft(); // Initial call
        this.timerId = setInterval(calculateTimeLeft, 1000);
    }

    pad(num: number): string {
        return num < 10 ? '0' + num : num.toString();
    }
}
