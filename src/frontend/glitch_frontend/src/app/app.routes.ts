import { Routes } from '@angular/router';
import { CreateAccountComponent } from '../app/pages/create-account/create-account';
import { LandingPageComponent } from './pages/landing-page/landing-page';
import { DashboardComponent } from './pages/dashboard/dashboard';
import {LoginComponent} from './pages/login/login'
import { ProfileComponent } from './pages/profile/profile';
import { UpdateAccount } from './pages/update-account/update-account';
import { PlayersListComponent } from './pages/players-list/players-list.component';
import { TournamentList } from './pages/tournament-list/tournament-list';
import { CreateTournament } from './pages/create-tournament/create-tournament';
import { ListGroup } from './pages/list-group/list-group';
import { CreateGroup } from './pages/create-group/create-group';
import { UpdateTeam } from './pages/update-team/update-team';
import { UpdateTournament } from './pages/update-tournament/update-tournament';

// Apenas o array de rotas, sem o @NgModule
export const routes: Routes = [
  { path:'', component: LandingPageComponent, pathMatch:'full' },
  { path: 'create-account', component: CreateAccountComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path:'login',component:LoginComponent},
  { path:'profile',component:ProfileComponent},
  { path:'update-account',component:UpdateAccount},
  { path: 'players', component: PlayersListComponent },
  {path:'tournaments',component:TournamentList},
  { path: 'tournaments/create-tournament', component: CreateTournament },
  {path:'groups',component:ListGroup},
  {path:'create-group',component:CreateGroup},
  {path:'update-team/:id',component:UpdateTeam},
  {path:'update-tournament/:id',component:UpdateTournament}
];
