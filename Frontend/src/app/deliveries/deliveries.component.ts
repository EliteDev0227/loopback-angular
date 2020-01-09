import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { OrdersService } from '@app/_services/orders.service';
import { Orders } from '@app/_models/orders';
import { Items } from '@app/_models/items';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { ExcelService } from '@app/_services/excel.service';

export interface DialogData {
  order_id: number;
}

@Component({
  selector: 'app-deliveries',
  templateUrl: './deliveries.component.html',
  styleUrls: ['./deliveries.component.css']
})
export class DeliveriesComponent implements OnInit {
  
  dtOption: any = {};
  start_date : any;
  end_date : any;

  orderList: Orders[];

  
  OrderStatus : any;

  constructor(private ordersService : OrdersService,
    public dialog: MatDialog) { 
      this.start_date = new Date();
      this.end_date = new Date();
      var month = this.end_date.getMonth();
      if (month < 11) {
        this.end_date.setMonth(month + 1);
      }
      else {
        this.end_date.setYear(this.end_date.getYear() + 1);
        this.end_date.setMonth(0);
      }
      this.getOrderList();
    this.OrderStatus = [
      'NOT_ASSIGNED',
      'ASSIGNED',
      'IN_PROGRESS',
      'DELIVERED',
      'FAILED_ON_DELIVERY',
      'CANCELLED'
    ];
  }

  ngOnInit() {
    this.dtOption = {
      dom: '<"float-right"B>frtip',
      displayLength: 100,
      "buttons": [
        'excel'
      ]
    };
  }

  onDateRangeChange(){
    this.getOrderList();
  }

  getOrderList(){
    this.ordersService.getOrdersByRange(this.start_date, this.end_date).subscribe(res => {
      this.orderList = res;
    })
  }

  onDeleteOrder(id:number){
    this.ordersService.deleteOrders(id).subscribe(res => {
        this.getOrderList();
    });
  }

  onViewItems(id:number) {
    const dialogRef = this.dialog.open(ViewItemsDialog, {
      width: '600px',
      data: {order_id: id}
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

}


@Component({
  selector: 'view-items-dialog',
  templateUrl: 'view-items-dialog.html',
})
export class ViewItemsDialog {
  order_id : number;
  itemList : Items[];
  typeStr: string[];
  

  constructor(
    public dialogRef: MatDialogRef<ViewItemsDialog>,
    private ordersService : OrdersService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      this.order_id = data.order_id;

      this.typeStr = ['', 'GIVE', 'RECEIVE'];

      this.getItemList();
    }
  
  getItemList(){
    this.ordersService.getOrdersById(this.order_id).subscribe(res => {
      this.itemList = res.items;
    })
  }

}

