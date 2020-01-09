import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule }    from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import {MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatStepperModule, MatDatepickerModule, MatNativeDateModule, MatCheckboxModule, MatSlideToggleModule, MatPaginatorModule} from '@angular/material';
import {MatDialogModule} from '@angular/material/dialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { DataTablesModule } from 'angular-datatables';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
// used to create fake backend
import { fakeBackendProvider } from './_helpers';

import { AppComponent }  from './app.component';
import { routing }        from './app.routing';

import { AlertComponent } from './_components';
import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { HomeComponent, AddQueueDialog, ExecuteDialog, ViewOrderDialog } from './home/home.component';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';;
import { ZonesComponent,  AddAreaDialog, AddZoneDialog, EditZoneDialog } from './zones/zones.component';
import { CustomersComponent, ViewAddressDialog } from './customers/customers.component';
import { DriversComponent, AddDriverDialog } from './drivers/drivers.component';
import { NeworderComponent, AddItemDialog } from './neworder/neworder.component';;
import { DeliveriesComponent, ViewItemsDialog } from './deliveries/deliveries.component'
import { DragDropModule } from '@angular/cdk/drag-drop';;
import { SettingsComponent } from './settings/settings.component'
import { CKEditorModule } from 'ngx-ckeditor';
import { FinanceComponent, ViewWalletDialog, AddEntryDialog } from './finance/finance.component';;
import { SurveyComponent, AddSurveyDialog, ViewSurveyDialog, FillAnswerDialog } from './survey/survey.component';
import { ToastrModule } from 'ngx-toastr';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { AmazingTimePickerModule } from 'amazing-time-picker';

import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ExcelService } from './_services/excel.service';
import { SocketService } from './_services/socket.service';

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        routing,
        MatPaginatorModule,MatTableModule,MatDialogModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatStepperModule,MatDatepickerModule,MatNativeDateModule,MatCheckboxModule,MatSlideToggleModule,
        DragDropModule ,
        BrowserAnimationsModule,
        DataTablesModule,
        NgbModule,
        FormsModule,        
        ReactiveFormsModule ,
        CKEditorModule ,ToastrModule.forRoot(), NgxMaterialTimepickerModule, AmazingTimePickerModule 
    ],
    declarations: [
        AppComponent,
        AlertComponent,
        HomeComponent,
        AddQueueDialog,
        ExecuteDialog,
        ViewOrderDialog,
        LoginComponent,
        RegisterComponent,
        ZonesComponent,
        AddAreaDialog,
        AddZoneDialog,
        EditZoneDialog,
        CustomersComponent,
        ViewAddressDialog,
        DriversComponent ,
        AddDriverDialog ,
        NeworderComponent,
        AddItemDialog ,
        DeliveriesComponent ,
        ViewItemsDialog,
        SettingsComponent,
        FinanceComponent,
        ViewWalletDialog,
        AddEntryDialog,
        SurveyComponent,
        AddSurveyDialog,
        ViewSurveyDialog,
        FillAnswerDialog    ],
    entryComponents: [
        AddQueueDialog,
        ExecuteDialog,
        ViewOrderDialog,
        AddAreaDialog,
        AddZoneDialog,
        EditZoneDialog,
        ViewAddressDialog,
        ViewItemsDialog,
        AddDriverDialog,
        AddItemDialog,
        ViewWalletDialog,
        AddEntryDialog,
        AddSurveyDialog,
        ViewSurveyDialog,
        FillAnswerDialog
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        {provide: LocationStrategy, useClass: HashLocationStrategy},
        ExcelService,
        SocketService

        // provider used to create fake backend
//        fakeBackendProvider
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }