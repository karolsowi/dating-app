import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { MainComponent } from './home/main/main.component';
import { MatchComponent } from './match/match.component';
import { MatchListComponent } from './matches/match-list/match-list.component';
import { ChatComponent } from './messages/chat/chat.component';
import { SettingsComponent } from './settings/settings/settings.component';

export const routes: Routes = [
    { path: 'auth/login', component: LoginComponent },
    { path: 'auth/register', component: RegisterComponent },
    { path: 'home', component: MainComponent },
    { path: 'match', component: MatchComponent },
    { path: 'matches', component: MatchListComponent },
    { path: 'messages', component: ChatComponent },
    { path: 'messages/:userId', component: ChatComponent },
    { path: 'settings', component: SettingsComponent },
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
    { path: '**', redirectTo: 'auth/login' }
];
