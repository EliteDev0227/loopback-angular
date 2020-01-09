import { Component, OnInit , Inject} from '@angular/core';
import { AuthenticationService } from '@app/_services';
import { Customers } from '@app/_models/Customers';
import { CustomersService } from '@app/_services/customers.service';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { AddressesService } from '@app/_services/addresses.service';
import { Addresses } from '@app/_models/addresses';
import { environment } from '@app/_services/environment';

export interface DialogData {
  customer_id: number;
  customer_name: string;
}

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  customerList : Customers[];
  dtOption: any;

  constructor(
    private authService: AuthenticationService,
    private customersService: CustomersService,
    public dialog: MatDialog
    ) {
      
    this.getCustomerList();
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

  getCustomerList(){
    let user = this.authService.currentUserValue;
    if(user){
      this.customersService.getCustomers().subscribe(res=>{

        this.customerList = res;
      });
    }else{
      if(localStorage.getItem("customerList") === null){
        return;
      }else{
        var localStorageItem = localStorage.getItem("customerList");
        var localStorageExtend : Customers[] = JSON.parse(localStorageItem);
        if(localStorageExtend.length > 0){
          this.customerList = localStorageExtend;
        }else{
         return;
        }
      }
    }
  }

  onDeleteCustomer(id:number){
    this.customersService.deleteCustomers(id).subscribe(res=>{
        this.getCustomerList();
  });
  }

  viewAddresses(id, name) {
    const dialogRef = this.dialog.open(ViewAddressDialog, {
      width: '800px',
      data: {customer_id: id, customer_name: name}
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }
}


@Component({
  selector: 'view-address-dialog',
  templateUrl: 'view-address-dialog.html',
})
export class ViewAddressDialog {
  apiBaseUrl = environment.apiUrl;
  customer_id : number;
  customer_name : string;
  addressList : Addresses[];
  

  constructor(
    public dialogRef: MatDialogRef<ViewAddressDialog>,
    private addressesService: AddressesService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      this.customer_id = data.customer_id;
      this.customer_name = data.customer_name;
      this.getAddressList();
    }
  
  getAddressList(){
    this.addressesService.getAddressesByCustomerId(this.customer_id).subscribe(res=>{
      this.addressList = res;
    });
  }
  onDeleteAddress(id: number) {
    this.addressesService.deleteAddresses(id).subscribe(res=>{
      if (res)
        this.getAddressList();
    });
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

}

