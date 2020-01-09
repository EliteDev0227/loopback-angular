import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';
import { AuthGuard } from './_guards';
import { ZonesComponent } from './zones/zones.component';
import { CustomersComponent } from './customers/customers.component';
import { DriversComponent } from './drivers/drivers.component'
import { NeworderComponent } from './neworder/neworder.component'
import { DeliveriesComponent } from './deliveries/deliveries.component';
import { SettingsComponent } from './settings/settings.component';
import { FinanceComponent } from './finance/finance.component';
import { SurveyComponent } from './survey/survey.component';

const appRoutes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'neworder', component: NeworderComponent },
    { path: 'deliveries', component: DeliveriesComponent },
    { path: 'customers', component: CustomersComponent },
    { path: 'drivers', component: DriversComponent },
    { path: 'zones', component: ZonesComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'finance', component: FinanceComponent },
    { path: 'survey', component: SurveyComponent },
    
    

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);