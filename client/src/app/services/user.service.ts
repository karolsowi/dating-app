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

    getUsers(): Observable<any[]> {
        const currentUserId = this.authService.currentUserValue?.id;
        return this.http.get<any[]>(`${this.apiUrl}?currentUserId=${currentUserId}`);
    }

    getUser(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    updateProfile(id: string, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, data);
    }
}
