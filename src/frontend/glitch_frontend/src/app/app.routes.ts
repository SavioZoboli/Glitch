import { Routes } from '@angular/router';
import { CreateAccountComponent } from '../app/pages/create-account/create-account';
import { LandingPageComponent } from './pages/landing-page/landing-page';
import { DashboardComponent } from './pages/dashboard/dashboard';

// Apenas o array de rotas, sem o @NgModule
export const routes: Routes = [
  { path:'', component: LandingPageComponent, pathMatch:'full' },
  { path: 'create-account', component: CreateAccountComponent },
  { path: 'dashboard', component: DashboardComponent }
];
