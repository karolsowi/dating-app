import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = 'http://localhost:3000/api/messages';

    constructor(private http: HttpClient, private authService: AuthService) { }

    sendMessage(toUserId: string, content: string): Observable<any> {
        const fromUserId = this.authService.currentUserValue?.id;
        return this.http.post(`${this.apiUrl}`, { fromUserId, toUserId, content });
    }

    getMessages(otherUserId: string): Observable<any[]> {
        const userId = this.authService.currentUserValue?.id;
        return this.http.get<any[]>(`${this.apiUrl}/${userId}/${otherUserId}`);
    }
}
