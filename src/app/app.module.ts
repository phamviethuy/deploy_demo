import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {AppRoutingModule,routingComponent} from './app-routing.module';

import { AppComponent } from './app.component';
import { from } from 'rxjs';
import { VegetableService } from './services/vegetable.service';
import { MaterialModule } from './material.module';
import { MainNavigationComponent } from './main-navigation/main-navigation.component';
import {DashboardComponent  } from './dashboard/dashboard.component';
import { UpLoadFileService } from './services/uploadFile.service';
import { CsvService } from './services/csv.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    AppComponent,
    routingComponent,
    MainNavigationComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    MaterialModule,
    BrowserAnimationsModule
  ],
  providers: [VegetableService,UpLoadFileService,CsvService],
  bootstrap: [AppComponent]
})
export class AppModule {}
