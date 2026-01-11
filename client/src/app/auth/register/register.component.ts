import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {
    registerForm: FormGroup;
    error = '';
    maxDob: string = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group(
            {
                name: ['', Validators.required],
                email: ['', [Validators.required, Validators.email]],
                password: ['', [Validators.required, Validators.minLength(6)]],
                confirmPassword: ['', Validators.required],
                dob: [''],
                userGender: ['', Validators.required],
                partnerGender: ['', Validators.required]
            },
            { validators: this.passwordsMatch }
        );
    
        // Calculate max allowed DoB so that the user must be of at least 18 years old
        const today = new Date();
        const year = today.getFullYear() - 18;
        const month = today.getMonth();
        const day = today.getDate();
        const maxDate = new Date(year, month, day);
        
        this.maxDob = maxDate.toISOString().split('T')[0];
    }

    partnerGenderOptions = [
        { value: 'woman', label: 'Women' },
        { value: 'man', label: 'Men' },
        { value: 'other', label: 'Other' }
    ];

    passwordsMatch(form: FormGroup) {
        const password = form.get('password')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;

        if (password !== confirmPassword) {
            return { mismatch: true };
        }
        return null;
    }

    onMultiSelectChange(event: any, controlName: string, labelEl: HTMLElement) {
        const value = event.target.value;
        const checked = event.target.checked;

        // Extract the label text (trim removes whitespace)
        const labelText = labelEl.textContent?.trim() || value;

        const current = this.registerForm.get(controlName)?.value || [];

        if (checked) {
            this.registerForm.get(controlName)?.setValue([...current, value]);
        } else {
            this.registerForm.get(controlName)?.setValue(
                current.filter((v: string) => v !== value)
            );
        }
    }

    getPartnerGenderLabels(): string {
        const values = this.registerForm.get('partnerGender')?.value || [];
        return values
            .map((v: string) => this.partnerGenderOptions.find(o => o.value === v)?.label)
            .join(', ');
    }

    onSubmit() {
        if (this.registerForm.invalid) return;

        this.authService.register(this.registerForm.value).subscribe({
            next: () => {
                this.router.navigate(['/auth/login']);
            },
            error: (err) => {
                this.error = err.error?.message || 'Registration failed';
            }
        });
    }
}
