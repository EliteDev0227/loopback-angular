import { Component, OnInit, Inject } from '@angular/core';
import { Drivers } from '@app/_models/Drivers';
import { DriversService } from '@app/_services/drivers.service';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WalletsService } from '@app/_services/wallets.service';

export interface DialogData {
  driver_id: number;
  mode: number;
}
@Component({
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.css']
})
export class FinanceComponent implements OnInit {
  driverList : Drivers[];
  dtOption : any;

  constructor(
    private driversService : DriversService,
    public dialog: MatDialog
  ) { 
    this.getDriverList();
  }

  ngOnInit() {
    this.dtOption = {
      dom: 'l<"float-right"B>frtip',
      displayLength: 100,
      "buttons": [
        'excel'
      ]
    };
  }

  getDriverList() {
    this.driversService.getDrivers().subscribe(res => {
      this.driverList = res;
    })

  }

  onWallet(id : number, mode : number) {

    const dialogRef = this.dialog.open(ViewWalletDialog, {
      width: '500px',
      data: {
        mode : mode,
        driver_id : id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true)
        this.getDriverList();
    });

  }

}


@Component({
  selector: 'view-wallet-dialog',
  templateUrl: 'view-wallet-dialog.html',
})
export class ViewWalletDialog {
  walletList : any;
  title : string;
  driver_id : number;
  mode : number;
  dtOption : any;
  start_date : any;
  end_date : any;

  constructor(
    public dialogRef: MatDialogRef<ViewWalletDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private walletsService : WalletsService,
    public dialog: MatDialog
    ) {
      this.start_date = new Date();
      this.end_date = new Date();
      this.start_date.setMonth(0);
      this.start_date.setDate(1);
      this.end_date.setMonth(11);
      this.end_date.setDate(31);

      this.driver_id = data.driver_id;
      this.mode = data.mode;
      if (this.mode == 1)
        this.title = "Main Wallet";
      else
        this.title = "Order Wallet";
      this.getWalletList();

      this.dtOption = {
        dom: 'l<"float-right"B>frtip',
        displayLength: 100,
        "buttons": [
          'excel'
        ]
      };
    }

    onDateRangeChange() {
      this.getWalletList();
    }

  getWalletList() {
    this.walletsService.getWalletsByDriver(this.driver_id, this.mode, this.start_date, this.end_date).subscribe(res => {
        this.walletList = res;
    });
  }

  onNewEntry() {
    const dialogRef = this.dialog.open(AddEntryDialog, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.walletsService.AddToWallets({
          ...result,
          driver_id : this.driver_id,
          type : this.mode
        }).subscribe(res => {
          this.getWalletList();
        });
      }
    });
  }


  onNoClick(): void {
    this.dialogRef.close(false);
  }

}


@Component({
  selector: 'add-entry-dialog',
  templateUrl: 'add-entry-dialog.html',
})
export class AddEntryDialog {
  
  form : FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddEntryDialog>,
    private walletsService : WalletsService,
    private formBuilder : FormBuilder
    ) {
      
      this.form = this.formBuilder.group({
        date: [],
        description: [],
        amount: [],
      });
    }


  onProceed() {
    if (this.form.invalid)
      return;
      this.dialogRef.close({
        date : this.form.get('date').value,
        description : this.form.get('description').value,
        amount : this.form.get('amount').value,
      })
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

}