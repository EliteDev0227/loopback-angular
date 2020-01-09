import { Component } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError  } from '@angular/router';

import { AuthenticationService } from './_services';
import { User } from './_models';
import { DriversService } from './_services/drivers.service';


@Component({ selector: 'app', templateUrl: 'app.component.html' })
export class AppComponent {
    currentUser: User;
    wallet: any;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private driversService: DriversService
    ) {
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
        this.wallet = null;

        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationStart) {
                // Show loading indicator
            }

            if (event instanceof NavigationEnd) {
                // Hide loading indicator
                this.driversService.getTotalWallet().subscribe(res => {
                    this.wallet = res[0].total_wallet;
                })
            }
        });
    }

    logout() {
        this.wallet = null;
        this.authenticationService.logout();
        this.router.navigate(['/login']);
    }
}