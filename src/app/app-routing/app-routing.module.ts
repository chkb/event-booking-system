import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { AuthGuard } from '../core/auth-guard.service';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { EmployeeCreateComponent } from '../employee/create/create.component';
import { EmployeeEditComponent } from '../employee/edit/edit.component';
import { EmployeeListComponent } from '../employee/list/list.component';
import { EventCreateComponent } from '../event/create/create.component';
import { EventListComponent } from '../event/list/list.component';
import { LoginEmailComponent } from '../login-email/login-email.component';
import { LoginComponent } from '../login/login.component';
import { SignupComponent } from '../signup/signup.component';
import { SkillComponent } from '../skill/skill.component';


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
