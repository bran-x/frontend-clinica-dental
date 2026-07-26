import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { PrivateShell } from './core/layout/private-shell/private-shell';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login'
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/views/login/login.view').then((component) => component.LoginView)
  },
  {
    path: 'auth/registro',
    loadComponent: () =>
      import('./features/auth/views/register/register.view').then((component) => component.RegisterView)
  },
  {
    path: '',
    component: PrivateShell,
    canActivateChild: [authGuard],
    children: [
      {
        path: 'pacientes',
        loadComponent: () =>
          import('./features/patients/views/patient-list/patient-list.view').then(
            (component) => component.PatientListView
          )
      },
      {
        path: 'citas',
        loadComponent: () =>
          import('./features/appointments/views/appointment-list/appointment-list.view').then(
            (component) => component.AppointmentListView
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
