import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { AuthGuard } from '../core/auth-guard.service';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { EmployeeEditComponent } from '../employee/edit/edit.component';
import { EmployeeListComponent } from '../employee/list/list.component';
import { EventTypeComponent } from '../event-type/event-type.component';
import { EventAdminComponent } from '../event/admin/admin.component';
import { EventCreateComponent } from '../event/create/create.component';
import { EventEditComponent } from '../event/edit/edit.component';
import { EventListComponent } from '../event/list/list.component';
import { LoginEmailComponent } from '../login-email/login-email.component';
import { LoginComponent } from '../login/login.component';
import { MessagesAdminComponent } from '../messages/admin/admin.component';
import { TableExpandableRowsComponent } from '../payout/admin-temp/admin.component';
import { PayoutEditComponent } from '../payout/edit/edit.component';
import { PayoutListComponent } from '../payout/list/list.component';
import { SignupComponent } from '../signup/signup.component';
import { SkillComponent } from '../skill/skill.component';
import { WagerComponent } from '../wager/wager.component';
import { ForgotComponent } from '../forgot/forgot.component';


const routes: Route[] = [
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'login-email',
        component: LoginEmailComponent,
    },
    {
        path: 'signup',
        component: SignupComponent,
    },
    {
        path: 'forgot',
        component: ForgotComponent,
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'event/create',
        component: EventCreateComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'event/list',
        component: EventListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'event/:id',
        component: EventEditComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'employee/list',
        component: EmployeeListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'employee/:id',
        component: EmployeeEditComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'skills',
        component: SkillComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'wager',
        component: WagerComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'event-typer',
        component: EventTypeComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'payout/list',
        component: PayoutListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'payout/:id',
        component: PayoutEditComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'messages/admin',
        component: MessagesAdminComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'event-admin',
        component: EventAdminComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'payout-admin',
        component: TableExpandableRowsComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forRoot(routes)
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
