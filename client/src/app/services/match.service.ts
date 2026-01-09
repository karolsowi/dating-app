import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class MatchService {
    private apiUrl = 'http://localhost:3000/api/matches';

    constructor(private http: HttpClient, private authService: AuthService) { }

    likeUser(toUserId: string): Observable<any> {
        const fromUserId = this.authService.currentUserValue?.id;
        return this.http.post(`${this.apiUrl}/like`, { fromUserId, toUserId });
    }

    getMatches(): Observable<any[]> {
        const userId = this.authService.currentUserValue?.id;
        return this.http.get<any[]>(`${this.apiUrl}/${userId}`);
    }
}
