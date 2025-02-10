import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../environments/environment';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { BrowserModule } from '@angular/platform-browser';
import { AuthenticationComponent } from './authentication/authentication.component';

export const routes: Routes = [
    {
        path: 'auth',
        component: AuthenticationComponent
    },
    { path: '', redirectTo: 'auth', pathMatch: 'full' },
    { path: '**', redirectTo: 'auth' }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes),
        BrowserModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireAuthModule
    ],
    exports: [
        RouterModule
    ]
})

export class AppRoutingModule { }