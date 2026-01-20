import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:3000/api/users';

    constructor(private http: HttpClient, private authService: AuthService) { }

    getCurrentUser(): any {
        return this.authService.currentUserValue;
    }

    getUsers(): Observable<any[]> {
        const currentUserId = this.authService.currentUserValue?.id;
        return this.http.get<any[]>(`${this.apiUrl}?currentUserId=${currentUserId}`);
    }

    getUser(id: string): Observable<any> {
        const currentUserId = this.authService.currentUserValue?.id;
        return this.http.get<any>(`${this.apiUrl}/${id}?currentUserId=${currentUserId}`);
    }

    updateProfile(id: string, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, data);
    }

    togglePhotoLike(photoUrl: string): Observable<any> {
        const fromUserId = this.authService.currentUserValue?.id;
        return this.http.post<any>(`${this.apiUrl}/photo/like`, { photoUrl, fromUserId });
    }
}
