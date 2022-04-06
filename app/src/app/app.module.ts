import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule }  from '@angular/material-moment-adapter';


import { AppComponent } from './app.component';
import { ShiftsComponent } from './shifts/shifts.component';
import { ShiftFormComponent } from './shift-form/shift-form.component';


@NgModule({
  declarations: [
    AppComponent,
    ShiftsComponent,
    ShiftFormComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    BrowserAnimationsModule,
    MatMomentDateModule,
  ],
  providers: [
    MatDatepickerModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
