import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:3000/api/auth';
    private currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || 'null'));
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) { }

    public get currentUserValue(): any {
        return this.currentUserSubject.value;
    }

    register(user: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, user).pipe(
            tap((res: any) => {
                // Auto login after register if desired, or just redirect
            })
        );
    }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            tap((res: any) => {
                if (res.user) {
                    localStorage.setItem('currentUser', JSON.stringify(res.user));
                    this.currentUserSubject.next(res.user);
                }
            })
        );
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
    }

    isLoggedIn(): boolean {
        return !!this.currentUserValue;
    }
}
