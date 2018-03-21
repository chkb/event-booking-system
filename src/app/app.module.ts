import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import daLocale from '@angular/common/locales/da';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AmazingTimePickerModule } from 'amazing-time-picker';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';

import { environment } from '../environments/environment';
import { AnimationComponent } from './animation/animation.component';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { AppComponent } from './app.component';
import { AppMaterialModule } from './app.material.module';
import { ArraySortPipe } from './array-sort.pipe';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { CookieService } from './cookie.service';
import { AuthGuard } from './core/auth-guard.service';
import { LoginProviderService } from './core/login-provider.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MyDateAdapter } from './date-adapter';
import { EmployeeCreateComponent } from './employee/create/create.component';
import { EmployeeEditComponent } from './employee/edit/edit.component';
import { EmployeeListComponent } from './employee/list/list.component';
import { EmployeeViewComponent } from './employee/view/view.component';
import { ErrorInterceptor } from './error.interceptor';
import { EventTypeComponent } from './event-type/event-type.component';
import { EventCreateComponent } from './event/create/create.component';
import { EventEditComponent } from './event/edit/edit.component';
import { EventListComponent } from './event/list/list.component';
import { EventViewComponent } from './event/view/view.component';
import { HoursMinutesSecondsPipe } from './hours-minutes-seconds.pipe';
import { LocalStorageService } from './localstorage.service';
import { LoginEmailComponent } from './login-email/login-email.component';
import { LoginComponent } from './login/login.component';
import { PayoutEditComponent } from './payout/edit/edit.component';
import { PayoutListComponent } from './payout/list/list.component';
import { SignupComponent } from './signup/signup.component';
import { SkillComponent } from './skill/skill.component';
import { WagerComponent } from './wager/wager.component';
import { WindowRef } from './window-reference';
import { EventHistoryComponent } from './event-history/event-history.component';
import { EmployeeDialogComponent } from './employee-dialog/employee-dialog.component';

registerLocaleData(daLocale);
@NgModule({
    declarations: [
        AppComponent,
        EmployeeCreateComponent,
        EmployeeEditComponent,
        EmployeeListComponent,
        EmployeeViewComponent,
        EventCreateComponent,
        EventEditComponent,
        EventListComponent,
        EventViewComponent,
        DashboardComponent,
        LoginComponent,
        SignupComponent,
        LoginEmailComponent,
        HoursMinutesSecondsPipe,
        ArraySortPipe,
        ConfirmDialogComponent,
        EmployeeDialogComponent,
        SkillComponent,
        WagerComponent,
        EventTypeComponent,
        AnimationComponent,
        PayoutListComponent,
        PayoutEditComponent,
        EventHistoryComponent
    ],
    imports: [
        FlexLayoutModule,
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        AngularFireModule.initializeApp(environment.firebase, 'standup-app'), // imports firebase/app needed for everything
        AngularFirestoreModule, // imports firebase/firestore, only needed for database features
        AngularFireAuthModule, // imports firebase/auth, only needed for auth features
        ReactiveFormsModule,
        AppMaterialModule,
        FormsModule,
        AmazingTimePickerModule
    ],

    entryComponents: [
        ConfirmDialogComponent,
        EventHistoryComponent,
        EmployeeDialogComponent
    ],
    providers: [
        LoginProviderService,
        AuthGuard,
        HoursMinutesSecondsPipe,
        ArraySortPipe,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorInterceptor,
            multi: true
        },
        {
            provide: LOCALE_ID,
            useValue: 'da'
        },
        {
            provide: DateAdapter,
            useClass: MyDateAdapter
        },
        LocalStorageService,
        CookieService,
        WindowRef
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
