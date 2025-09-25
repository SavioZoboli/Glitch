import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateAccountComponent } from '../app/pages/create-account/create-account';
import { LandingPage } from './pages/landing-page/landing-page';

const routes: Routes = [
  {path:'',component:LandingPage,pathMatch:'full'},
  { path: 'create-account', component: CreateAccountComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


