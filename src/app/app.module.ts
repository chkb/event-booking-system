import { DatePipe, registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import daLocale from '@angular/common/locales/da';
import { LOCALE_ID, NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { environment } from '../environments/environment';
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
import { EmployeeDialogComponent } from './employee-dialog/employee-dialog.component';
import { EmployeeEditComponent } from './employee/edit/edit.component';
import { EmployeeListComponent } from './employee/list/list.component';
import { EmployeeViewComponent } from './employee/view/view.component';
import { ErrorInterceptor } from './error.interceptor';
import { EventHistoryComponent } from './event-history/event-history.component';
import { EventTypeComponent } from './event-type/event-type.component';
import { EventUpcommingComponent } from './event-upcomming/event-upcomming.component';
import { EventAdminComponent } from './event/admin/admin.component';
import { EventCreateComponent } from './event/create/create.component';
import { EventEditComponent } from './event/edit/edit.component';
import { EventListComponent } from './event/list/list.component';
import { EventViewComponent } from './event/view/view.component';
import { ForgotComponent } from './forgot/forgot.component';
import { HoursMinutesSecondsPipe } from './hours-minutes-seconds.pipe';
import { LocalStorageService } from './localstorage.service';
import { LoginEmailComponent } from './login-email/login-email.component';
import { LoginComponent } from './login/login.component';
import { MessagesAdminComponent } from './messages/admin/admin.component';
import { MessagesViewComponent } from './messages/view/view.component';
import { OrderByPipe } from './order-by.pipe';
import { TableExpandableRowsComponent } from './payout/admin-temp/admin.component';
import { PayoutAdminComponent } from './payout/admin/admin.component';
import { PayoutEditComponent } from './payout/edit/edit.component';
import { PayoutListComponent } from './payout/list/list.component';
import { SignupComponent } from './signup/signup.component';
import { SkillComponent } from './skill/skill.component';
import { StatComponent } from './stat/stat.component';
import { WagerComponent } from './wager/wager.component';
import { WindowRef } from './window-reference';

registerLocaleData(daLocale);
@NgModule({
    declarations: [
        AppComponent,
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
        ForgotComponent,
        LoginEmailComponent,
        HoursMinutesSecondsPipe,
        ArraySortPipe,
        ConfirmDialogComponent,
        EmployeeDialogComponent,
        SkillComponent,
        WagerComponent,
        EventTypeComponent,
        PayoutListComponent,
        PayoutEditComponent,
        EventHistoryComponent,
        MessagesAdminComponent,
        MessagesViewComponent,
        EventAdminComponent,
        StatComponent,
        EventUpcommingComponent,
        OrderByPipe,
        PayoutAdminComponent,
        TableExpandableRowsComponent
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
        FormsModule
    ],

    entryComponents: [
        ConfirmDialogComponent,
        EventHistoryComponent,
        EmployeeDialogComponent,
        MessagesViewComponent,
        StatComponent
    ],
    providers: [
        LoginProviderService,
        AuthGuard,
        HoursMinutesSecondsPipe,
        ArraySortPipe,
        DatePipe,
        OrderByPipe,
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
