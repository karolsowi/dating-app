import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { MainComponent } from './home/main/main.component';
import { MatchComponent } from './match/match.component';
import { MatchListComponent } from './matches/match-list/match-list.component';
import { ChatComponent } from './messages/chat/chat.component';
import { SettingsComponent } from './settings/settings/settings.component';
import { Profile } from './profile/profile';

export const routes: Routes = [
    { path: 'auth/login', component: LoginComponent },
    { path: 'auth/register', component: RegisterComponent },
    { path: 'home', component: MainComponent },
    { path: 'match', component: MatchComponent }, // Kept for existing links
    { path: 'matches', component: MatchListComponent },
    { path: 'messages', component: ChatComponent },
    { path: 'messages/:userId', component: ChatComponent },
    { path: 'profile/:id', component: Profile },
    { path: 'settings', component: SettingsComponent },
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
    { path: '**', redirectTo: 'auth/login' }
];
