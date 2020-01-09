import { Component, OnInit, Inject, HostListener } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { ZonesService } from '@app/_services/zones.service';
import { Zones } from '@app/_models/zones';
import { QueuesService } from '@app/_services/queues.service';
import { OrdersService } from '@app/_services/orders.service';
import { Orders } from '@app/_models/orders';
import { Queues } from '@app/_models/queues';
import { DriversService } from '@app/_services/drivers.service';
import { Drivers } from '@app/_models/drivers';
import { ToastrService } from 'ngx-toastr';
import {formatDate } from '@angular/common';
import { ItemsService } from '@app/_services/items.service';
import { AddItemDialog } from '@app/neworder/neworder.component';

export interface DialogData {
  item: any;
  mode: any;
}


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  unassignedOrderList : any;
  failedOrderList : any[];
  rejectedOrderList : any[];
  runningQueueList : any;
  stoppedQueueList : any;
  zoneList : Zones[];
  dateList : any;

  drop(event: CdkDragDrop<string[]>) {
    let temp = (event.container.data);
    let tempPrev = (event.previousContainer.data);


    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      var flag1 = false, flag2 = false;
      for (var i = 0; i < this.unassignedOrderList.length; i++) {
        if (temp == this.unassignedOrderList[i])
          flag1 = true;
      }
      if (flag1) {
        return;
      }
      event.currentIndex++;
      event.previousIndex++;

      var curItem = (Object)(event.previousContainer.data[event.previousIndex]);
      var firstItem = (Object)(event.container.data[0]);
      if (firstItem.delivery_date != curItem.delivery_date) {
        this.toastr.warning('Order date and Queue date must be same.', 'Warning');
        return;
      }
      if (firstItem.zone_id != curItem.address.zone_id) {
        this.toastr.warning('Order Zone and Queue Zone must be same.', 'Warning');
        return;
      }
      if (firstItem.delivery_date != curItem.delivery_date) {
        this.toastr.warning('Order date and Queue date must be same.', 'Warning');
        return;
      }

        transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }
  constructor(public dialog: MatDialog,
    public queuesService: QueuesService,
    public zonesService: ZonesService,
    public ordersService: OrdersService,
    private toastr: ToastrService) { 
      this.getOrderList();
      this.getQueueList();
      this.zonesService.getZones().subscribe(res => {
        this.zoneList = res;
      })
    }

  ngOnInit() {
  }

  getOrderList(){
    this.ordersService.getUnassignedOrders().subscribe(res => {
      this.unassignedOrderList = [];
      for (var i = 0; i < res.length; i++) {
        if (!res[i].address) {
          continue;
        }
        
        if (!this.unassignedOrderList[res[i].address.zone_id]) {
          this.unassignedOrderList[res[i].address.zone_id] = [];
          this.unassignedOrderList[res[i].address.zone_id].push({});
        }
        this.unassignedOrderList[res[i].address.zone_id].push(res[i]);
      }
    });
    this.ordersService.getFailedOrders().subscribe(res => {
      this.failedOrderList = res;
    });
    this.ordersService.getRejectedOrders().subscribe(res => {
      this.rejectedOrderList = res;
    });
  }

  getQueueList(){
    this.queuesService.getQueueDates().subscribe(res => {
      this.dateList = res;
      this.stoppedQueueList = [];
      this.runningQueueList = [];

      // for (var i = 0; i < res.length; i++) {
      //   this.queuesService.getStoppedQueues(res[i].queue_date).subscribe(queues => {
      //     for (var i = 0; i < queues.length; i++) {
      //       queues[i].orders = [];
      //       queues[i].orders.push({
      //         delivery_date : queues[i].queue_date, 
      //         zone_id : queues[i].zone_id
      //       });
      //     }
      //     this.stoppedQueueList.push(queues);
      //   });
      //   this.queuesService.getRunningQueues(res[i].queue_date).subscribe(res => {
      //     this.runningQueueList.push(res);
      //   });
      // }

      console.log('dates', this.dateList);
      this.queuesService.getStoppedQueues().subscribe(queues => {
        for (var i = 0; i < queues.length; i++) {
            if (!queues[i].orders || queues[i].orders.length == 0) {
              queues[i].orders = [];
              queues[i].orders.push({
                delivery_date : queues[i].queue_date, 
                zone_id : queues[i].zone_id
              });
            } 
            else {
              queues[i].orders.splice(0, 0, {
                delivery_date : queues[i].queue_date, 
                zone_id : queues[i].zone_id
              });
            }


            if (!this.stoppedQueueList[queues[i].queue_date])
              this.stoppedQueueList[queues[i].queue_date] = [];
            this.stoppedQueueList[queues[i].queue_date].push(queues[i]);
        }
        console.log('stopped', this.stoppedQueueList);
      })

      this.queuesService.getRunningQueues().subscribe(res => {
        for (var i = 0; i < res.length; i++) {
          if (!this.runningQueueList[res[i].queue_date])
            this.runningQueueList[res[i].queue_date] = [];
          this.runningQueueList[res[i].queue_date].push(res[i]);
        }
        console.log('running', this.runningQueueList);

      });
  
    });


  }

  onDetailOrder(item : Orders, mode : number, orderList : Orders[]) {
    const dialogRef = this.dialog.open(ViewOrderDialog, {
      width: '700px',
      data : {item: item, mode : mode},
      disableClose : true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getQueueList();
        this.getOrderList();
      }
    });
  }



  onRemove(id : number) {
    if (confirm('Do you really want to delete queue?')) {
      this.queuesService.deleteQueues(id).subscribe(res => {
        this.getQueueList();
        this.getOrderList();
      })
    }
  }

  onRemoveOrderFromQueue(orderList, order) {
    console.log('on remove');
    for (var i = 0; i < orderList.length; i++) {
      if (orderList[i].id == order.id) {
        orderList.splice(i, 1);
        this.unassignedOrderList[order.address.zone_id].push(order);
        break;
      }
    }
  }

  onExecute(item : Queues, orders : Orders[]) {
    if (orders.length == 0) {
      this.toastr.warning('Queue should have at least one order.', 'Warning');
      return;
    }
    for (var i = 0; i < orders.length; i++) {
      if (item.queue_date != orders[i].delivery_date) {
        this.toastr.warning('Order date and Queue date must be same.', 'Warning');
        return;
      }
    }

    
    const dialogRef = this.dialog.open(ExecuteDialog, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('driver_id', result)
        //assign driver_id to queue
        //assign queue_id to order
        this.doExecuteQueue(item.id, result, orders, false);
      }
    });
  }

  doExecuteQueue(id, driver_id, orders, ignore) {
    this.queuesService.executeQueue(id, driver_id, orders, ignore).subscribe(res => {
      if (res.status == -1) {
        if (confirm(res.msg + "Are you sure you want to assign queue?")) {
          this.doExecuteQueue(id, driver_id, orders, true);
        }
      }
      else if (res.status == 0) {
        this.toastr.error(res.msg, 'Execute Failed');
      }
      else if (res.status == 1) {
        this.toastr.success('Queue is Started!', 'Execute Success');
        this.getQueueList();
        this.getOrderList();
      }
    });
  }

  onStop(id : number) {
    this.queuesService.stopQueue(id).subscribe(res => {
      if (res.status.msg)
        this.toastr.error(res.status.msg, 'Stop Failed');
      else
        this.toastr.success('Queue is stopped!', 'Stop Success');
      this.getQueueList();
      this.getOrderList();
    })
  }
  onNewQueue() {
    const dialogRef = this.dialog.open(AddQueueDialog, {
      width: '400px',
      data: {mode:'Add'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.queuesService.AddToQueues(result).subscribe(res => {
          this.getQueueList();
        });
      }
    });
  }

  onEditQueue(queue: Queues) {
    const dialogRef = this.dialog.open(AddQueueDialog, {
      width: '400px',
      data: {mode:'Edit', item : queue}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.queuesService.AddToQueues(result).subscribe(res => {
          this.getQueueList();
        });
      }
    });
  }

}

@Component({
  selector: 'add-queue-dialog',
  templateUrl: 'add-queue-dialog.html',
})
export class AddQueueDialog {
  mode : any;
  zoneList : Zones[];
  queue_id : any;

  form : FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddQueueDialog>,
    private zonesService: ZonesService,
    private formBuilder : FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      this.mode = data.mode;
      if (this.mode == 'Add') {
        this.form = this.formBuilder.group({
          zone_id: [],
          queue_date: [],
          start_time: ["00:00:00"]
        });  
        this.queue_id = null;
      }
      else {
        this.queue_id = data.item.id;
        this.form = this.formBuilder.group({
          zone_id: data.item.zone_id,
          queue_date: data.item.queue_date,
          start_time: data.item.start_time
        });  
      }
      this.zonesService.getZones().subscribe(res =>{
        this.zoneList = res;
      });
    }
  
  onProceed() {
    if (this.form.invalid)
    {
      console.log('dirty');
      return;
    }
    this.dialogRef.close({
      id : this.queue_id,
      zone_id : this.form.get('zone_id').value,
//      queue_date : formatDate(this.form.get('queue_date').value, 'yyyy-MM-dd', 'en-US'),
      queue_date : this.form.get('queue_date').value,
      start_time : this.form.get('start_time').value
    });
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

}

@Component({
  selector: 'execute-dialog',
  templateUrl: 'execute-dialog.html',
})
export class ExecuteDialog {
  driverList : Drivers[];

  form : FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ExecuteDialog>,
    private driversService: DriversService,
    private formBuilder : FormBuilder) {
      this.form = this.formBuilder.group({
        driver_id: [],
      });  
      this.driversService.getUnassignedDrivers().subscribe(res =>{
        this.driverList = res;
      });
    }
  
  onProceed() {
    if (this.form.invalid)
    {
      console.log('dirty');
      return;
    }
    this.dialogRef.close(this.form.get('driver_id').value);
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

}


@Component({
  selector: 'view-order-dialog',
  templateUrl: 'view-order-dialog.html',
})
export class ViewOrderDialog {
  orderItem : any;
  mode : number;
  statusStr: string[];
  typeStr: string[];

  deletedIds : any;

  constructor(
    public dialogRef: MatDialogRef<ViewOrderDialog>,
    private driversService: DriversService,
    private formBuilder : FormBuilder,
    private ordersService : OrdersService,
    public dialog: MatDialog,
    private itemsService : ItemsService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private toastr : ToastrService
    ) {
      this.orderItem = data.item;
      this.mode = data.mode;
      this.statusStr = ['', 'In Stock', 'Not In Stock'];
      this.typeStr = ['', 'GIVE', 'RECEIVE'];
      this.deletedIds = [];
    }

  onDeleteItem(id : number) {
    for (var i = 0; i < this.orderItem.items.length; i++) {
      if (this.orderItem.items[i].id == id)
      {
        this.deletedIds.push(id);
        this.orderItem.items.splice(i, 1);
        break;
      }
    }
    var sum = 0;
    for (var i = 0; i < this.orderItem.items.length; i++) {
      if (this.orderItem.items[i].type == 1) {
        sum += this.orderItem.items[i].price;
      }
      else {
        sum -= this.orderItem.items[i].price;
      }
    }
    this.orderItem.value = sum;
  }

  onAddItem() {
    
    const dialogRef = this.dialog.open(AddItemDialog, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result)
      {
        result.type = 1;
        result.order_id = this.orderItem.id;
        this.itemsService.AddToItems(result).subscribe(res => {
          this.orderItem.items.push(res);
          this.orderItem.value += res.price;
        });
      }
    });
  }

  onUpdateItems() {
    for (var i = 0; i < this.deletedIds.length; i++) {
      this.itemsService.deleteItems(this.deletedIds[i]).subscribe(res => {

      });
    }
    this.ordersService.AddToOrders({id:this.orderItem.id, value:this.orderItem.value}).subscribe(res => {
      this.dialogRef.close(null);
    });

    // this.ordersService.updateItems(this.orderItem).subscribe(res => {
    //   this.dialogRef.close(null);
    // });
  }
  onMarkArrived() {
    this.ordersService.markArrived(this.orderItem.id).subscribe(res => {
      if (res.status == 1)
        this.dialogRef.close(true);
      else
        this.toastr.error(res.msg, 'Error');
    });
  }
  onHoldOrder() {
    this.ordersService.holdOrder(this.orderItem.id).subscribe(res => {
      this.dialogRef.close(true);
    });
  }
  onCancelOrder() {
    this.ordersService.cancelOrder(this.orderItem.id).subscribe(res => {
      this.dialogRef.close(true);
    });
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

}