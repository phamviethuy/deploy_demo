import {NgModule} from '@angular/core';
import {RouterModule,Routes} from '@angular/router';
import { from } from 'rxjs';
import {CsvconvertComponent} from './csvconvert/csvconvert.component'

const appRoutes: Routes=[
    {path:"Home",component:CsvconvertComponent},
    { path: '', redirectTo: '/Home', pathMatch: 'full' }
  ]

  @NgModule({
      imports: [RouterModule.forRoot(appRoutes)],
      exports: [RouterModule]
  })
  export class AppRoutingModule{}
  export const routingComponent = [CsvconvertComponent]