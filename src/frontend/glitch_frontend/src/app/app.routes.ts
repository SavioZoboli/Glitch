import { Routes } from '@angular/router';
import { CreateAccountComponent } from '../app/pages/create-account/create-account';
import { LandingPageComponent } from './pages/landing-page/landing-page';
import { DashboardComponent } from './pages/dashboard/dashboard';
import {LoginComponent} from './pages/login/login'
import { ProfileComponent } from './pages/profile/profile';
import { UpdateAccount } from './pages/update-account/update-account';
import { PlayersListComponent } from './pages/players-list/players-list.component';

// Apenas o array de rotas, sem o @NgModule
export const routes: Routes = [
  { path:'', component: LandingPageComponent, pathMatch:'full' },
  { path: 'create-account', component: CreateAccountComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path:'login',component:LoginComponent},
  { path:'profile',component:ProfileComponent},
  { path:'update-account/:id',component:UpdateAccount},
  { path: 'jogadores', component: PlayersListComponent }
];
