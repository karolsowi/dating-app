import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { MainComponent } from './home/main/main.component';
import { MatchComponent } from './match/match.component';
import { MatchListComponent } from './matches/match-list/match-list.component';
import { ChatComponent } from './messages/chat/chat.component';
import { SettingsComponent } from './settings/settings/settings.component';
import { Profile } from './profile/profile';
import { EditProfileComponent } from './settings/edit-profile';
import { NotificationsComponent } from './settings/notifications';
import { SubscriptionComponent } from './settings/subscription';
import { GeneralComponent } from './settings/general';
import { BlockedComponent } from './settings/blocked';
import { HelpComponent } from './settings/help';

export const routes: Routes = [
    { path: 'auth/login', component: LoginComponent },
    { path: 'auth/register', component: RegisterComponent },
    { path: 'home', component: MatchComponent },
    { path: 'match', component: MatchComponent },
    { path: 'matches', component: MatchListComponent },
    { path: 'messages', component: ChatComponent },
    { path: 'messages/:userId', component: ChatComponent },
    { path: 'profile/:id', component: Profile },
    {
        path: 'settings',
        component: SettingsComponent,
        children: [
            { path: '', redirectTo: 'edit', pathMatch: 'full' },
            { path: 'edit', component: EditProfileComponent },
            { path: 'notifications', component: NotificationsComponent },
            { path: 'subscription', component: SubscriptionComponent },
            { path: 'general', component: GeneralComponent },
            { path: 'blocked', component: BlockedComponent },
            { path: 'help', component: HelpComponent }
        ]
    },
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
    { path: '**', redirectTo: 'auth/login' }
];
