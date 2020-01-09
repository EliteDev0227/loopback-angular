import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { MatStepper, MatDialogRef, MatDialog } from '@angular/material';
import { CustomersService } from '@app/_services/customers.service';
import { Addresses } from '@app/_models/addresses';
import { ZonesService } from '@app/_services/zones.service';
import { AreasService } from '@app/_services/areas.service';
import { Areas } from '@app/_models/Areas';
import { Zones } from '@app/_models/zones';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { AddressesService } from '@app/_services/addresses.service';
import { Items } from '@app/_models/items';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrdersService } from '@app/_services/orders.service';
import { ItemsService } from '@app/_services/items.service';
import { Router } from '@angular/router';
import {formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Orders } from '@app/_models/orders';
import { SocketService } from '@app/_services/socket.service';
import { AuthenticationService } from '@app/_services';

@Component({
  selector: 'app-neworder',
  templateUrl: './neworder.component.html',
  styleUrls: ['./neworder.component.css']
})
export class NeworderComponent implements OnInit, OnChanges {
  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    console.log(changes);
    throw new Error("Method not implemented.");
  }
  type: number;

  addressList : Addresses[];
  zoneList : Zones[];
  areaList : Areas[];
  deliveredOrders : Orders[];

  form1 : FormGroup;
  customer_id : number;
  phone: string;
  name : string;

  address_id: number;
  zone_id : number;
  area_id : number;
  address : string;
  building : string;
  floor : string;

  order_number : number;
  delivery_date : string;
  delivery_time_from : string;
  delivery_time_to : string;
  value : number;
  @Input() sendItemList : Items[];
  receiveItemList : Items[];

  constructor(public customersService : CustomersService,
    public zonesService : ZonesService,
    public areasService : AreasService,
    public addressesService : AddressesService,
    public ordersService : OrdersService,
    public itemsService : ItemsService,
    public router : Router,
    public dialog: MatDialog,
    private formBuilder : FormBuilder,
    // private socketService : SocketService,
    // private authenticationService: AuthenticationService,
    private toastr: ToastrService) { 

//      this.socketService.sendMessage({token : this.authenticationService.currentUserValue.id});
      this.zonesService.getZones().subscribe(res=>{
        this.zoneList = res;
      });
      this.form1 = this.formBuilder.group({
        phone: [],
        name: [],
        zone_id: [],
        area_id: [],
        address: [],
        building: [],
        floor: [],
      });
      this.sendItemList = new Array();
      this.receiveItemList = new Array();
      this.deliveredOrders = new Array();
      this.value = 0;

    }

  ngOnInit() {
  }

  gotoStep2(stepper: MatStepper, type : number){
    this.type = type;
      stepper.next();
  }


  onSearchCustomer() {
    if (this.form1.get('phone').invalid)
      return;
    this.customersService.getCustomersByPhone(this.form1.get('phone').value).subscribe(res=>{
      if (res.length > 0) {
        let customer = res[0];
        this.setCustomerId(customer.id);
        this.name = customer.name;
        this.form1.get('name').setValue(customer.name);
        this.addressList = customer.addresses;
      }
    });

  }

  onSelectZone(event) {
    var zoneId = this.form1.get('zone_id').value;
    this.areasService.getAreasByZoneId(zoneId).subscribe(res => {
      this.areaList = res;
    })
  }

  onChooseAddress(item : Addresses) {
    this.address_id = item.id;
    this.form1.get('zone_id').setValue(item.zone_id);
    this.form1.get('area_id').setValue(item.area_id);
    this.form1.get('address').setValue(item.address);
    this.form1.get('building').setValue(item.building);
    this.form1.get('floor').setValue(item.floor);
  }

  onNewAddress() {
    this.address_id = null;
    this.form1.get('zone_id').setValue(null);
    this.form1.get('area_id').setValue(null);
    this.form1.get('address').setValue(null);
    this.form1.get('building').setValue(null);
    this.form1.get('floor').setValue(null);
  }

  addAddress(stepper : MatStepper){
    this.addressesService.AddToAddresses({
      zone_id : this.form1.get('zone_id').value,
      area_id : this.form1.get('area_id').value,
      address : this.form1.get('address').value,
      building : this.form1.get('building').value,
      floor : this.form1.get('zone_id').value,
      customer_id : this.customer_id
    }).subscribe(res=>{
      if (res)
      {
        this.address_id = res.id;
        stepper.next();
      }
    });
  }

  setCustomerId(id) {
    this.customer_id = id;
    this.ordersService.getDeliveredOrders(id).subscribe(res => {
      this.deliveredOrders = res;
      console.log('delivered orders', res);
    })
  }

  onUseAddress(stepper: MatStepper){
    if (this.form1.invalid)
      return;
    if (this.customer_id != null && this.address_id != null)  // Use existing customer and address
    {
      stepper.next();
      return;
    }
    if (this.address_id == null)  // New Address
    {
      //See if customer exists
      this.customersService.getCustomersByPhone(this.form1.get('phone').value).subscribe(res=>{
        if (res.length > 0)
        {
          this.setCustomerId(res[0].id);
          this.addAddress(stepper);
        }
        else
        {
          this.customersService.AddToCustomers({
            name: this.form1.get('name').value,
            phone: this.form1.get('phone').value
          }).subscribe(res =>{
            if (res)
            {
              console.log('new customer', res);
              this.setCustomerId(res.id);
              this.addAddress(stepper);
            }
          });
        }
      });
    }
  }

  onAddItem() {
    const dialogRef = this.dialog.open(AddItemDialog, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result)
      {
        result['index'] = this.sendItemList.length;
        this.sendItemList.push(result);
        this.doCalcValue();
      }
    });
  }

  onDeleteItem(index: number){
    console.log('to delete index', index)
    for (var i = 0; i < this.sendItemList.length; i++)
    {
      if (this.sendItemList[i].index == index)
      {
        this.sendItemList.splice(i, 1);
        this.doCalcValue();
        return;
      }
    }
  }

  onSearchOrder(){
    this.ordersService.getOrdersById(this.order_number).subscribe(res=>{
      this.receiveItemList = [];
      for (var i = 0; i < res.items.length; i++) {
        if (res.items[i].refund != 1 && res.items[i].type == 1) {
          this.receiveItemList.push(res.items[i]);
        }
      }
    });
  }

  doCalcValue()
  {
    var sum = 0;
    for (var i = 0; i < this.sendItemList.length; i++)
    {
      sum += this.sendItemList[i].price;
    }
    for (var i = 0; i < this.receiveItemList.length; i++)
    {
      if (!this.receiveItemList[i].checked)
        continue;
      sum -= this.receiveItemList[i].price;
    }
    this.value = sum;

  }

  doCreateNewOrder() {
    if (!this.type || !this.customer_id || !this.address_id || !this.delivery_date) {
      this.toastr.warning('You should input Address, Delivery date and time correctly.', 'Warning');
      return;
    }
    if (this.type != 3 && this.sendItemList.length == 0){
      this.toastr.warning('You should add at least one item.', 'Warning');
      return;
    }

      var itemList = [];
      var refundCnt = 0;
      for (var i = 0; i < this.receiveItemList.length; i++)
      {
        if (!this.receiveItemList[i].checked)
          continue;
        this.receiveItemList[i]['type'] = 2;
        this.receiveItemList[i]['org_id'] = this.receiveItemList[i].id;
        this.receiveItemList[i]['refund'] = 0;
        this.receiveItemList[i]['id'] = null;
        itemList.push(this.receiveItemList[i]);
        refundCnt++;
      }
      if (this.type > 1 && refundCnt == 0) {
        this.toastr.warning('You should choose at least one item from delivered order.', 'Warning');
        return;
      }

      for (var i = 0; i < this.sendItemList.length; i++)
      {
        this.sendItemList[i]['type'] = 1;
        itemList.push(this.sendItemList[i]);
      }

      //Create order
      this.ordersService.AddToOrders({
        customer_id : this.customer_id,
        address_id : this.address_id,
        type : this.type,
//        delivery_date : formatDate(this.delivery_date, 'yyyy-MM-dd', 'en-US').toString().substr(0, 10),
        delivery_date : this.delivery_date,
        delivery_time_from : this.delivery_time_from,
        delivery_time_to : this.delivery_time_to,
        items : itemList
      }).subscribe(res=>{
        this.toastr.success('Order created successfully!', 'Success');
        this.router.navigate(['/home']);
      });
  }

  goForward(stepper: MatStepper){
      stepper.next();
  }
}

@Component({
  selector: 'add-item-dialog',
  templateUrl: 'add-item-dialog.html',
})
export class AddItemDialog {
  name : string;
  size : string;
  price : number;
  form : FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddItemDialog>,
    private zonesService: ZonesService,
    private formBuilder : FormBuilder) {
      this.form = this.formBuilder.group({
        name: [],
        size: [],
        price: []
      });  
    }
  
  onProceed() {
    if (this.form.invalid)
    {
      console.log('dirty');
      return;
    }
    this.dialogRef.close({
      name : this.form.get('name').value,
      size : this.form.get('size').value,
      price : this.form.get('price').value
    });
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

}