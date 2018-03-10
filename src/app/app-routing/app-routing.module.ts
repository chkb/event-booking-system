import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { AuthGuard } from '../core/auth-guard.service';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { EmployeeCreateComponent } from '../employee/create/create.component';
import { EmployeeEditComponent } from '../employee/edit/edit.component';
import { EmployeeListComponent } from '../employee/list/list.component';
import { EventTypeComponent } from '../event-type/event-type.component';
import { EventCreateComponent } from '../event/create/create.component';
import { EventEditComponent } from '../event/edit/edit.component';
import { EventListComponent } from '../event/list/list.component';
import { LoginEmailComponent } from '../login-email/login-email.component';
import { LoginComponent } from '../login/login.component';
import { SignupComponent } from '../signup/signup.component';
import { SkillComponent } from '../skill/skill.component';
import { WagerComponent } from '../wager/wager.component';


const routes: Route[] = [
    {
        path: '',
        redirectTo: '/login',
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
        path: 'employee/create',
        component: EmployeeCreateComponent,
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
