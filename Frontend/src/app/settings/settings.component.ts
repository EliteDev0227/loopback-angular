import { Component, OnInit } from '@angular/core';
import { SettingsService } from '@app/_services/settings.service';
import { Settings } from '@app/_models/settings';
import { ZonesService } from '@app/_services/zones.service';
import { Zones } from '@app/_models/zones';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '@app/_services';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  
  zoneList : Zones[];
  settings : Settings[];
  TIME_PER_ORDER : number;
  TIME_PER_EXCHANGE : number;
  TIME_PER_REFUND : number;
  ORDERS_PER_BIKE : number;
  ORDERS_PER_CAR : number;
  CASH_PER_DRIVER : number;
  WAREHOUSE_POS : string;
  password : string;
  retype : string;

  constructor(
    private settingsService : SettingsService,
    private zonesService : ZonesService,
    private toastr: ToastrService,
    private userService: UserService
  ) { 
    this.loadSettings();
  }

  ngOnInit() {
  }

  loadSettings()
  {
    this.zonesService.getZones().subscribe(res => {
      this.zoneList = res;
    });
    this.settingsService.getSettings().subscribe(res => {
      this.settings = res;
      for (var i = 0; i < res.length; i++)
      {
        if (res[i].key == "TIME_PER_ORDER")
          this.TIME_PER_ORDER = res[i].value;
        if (res[i].key == "TIME_PER_EXCHANGE")
          this.TIME_PER_EXCHANGE = res[i].value;
        if (res[i].key == "TIME_PER_REFUND")
          this.TIME_PER_REFUND = res[i].value;
        if (res[i].key == "ORDERS_PER_BIKE")
          this.ORDERS_PER_BIKE = res[i].value;
        if (res[i].key == "ORDERS_PER_CAR")
          this.ORDERS_PER_CAR = res[i].value;
        if (res[i].key == "CASH_PER_DRIVER")
          this.CASH_PER_DRIVER = res[i].value;
        if (res[i].key == "WAREHOUSE_POS")
          this.WAREHOUSE_POS = res[i].value;
        }
    });
  }

  onSave() {
    this.zonesService.SaveBikeable(this.zoneList).subscribe(res => {

    });
    this.settingsService.SaveSettings([
      {key : "TIME_PER_ORDER", value : this.TIME_PER_ORDER},
      {key : "TIME_PER_EXCHANGE", value : this.TIME_PER_EXCHANGE},
      {key : "TIME_PER_REFUND", value : this.TIME_PER_REFUND},
      {key : "ORDERS_PER_BIKE", value : this.ORDERS_PER_BIKE},
      {key : "ORDERS_PER_CAR", value : this.ORDERS_PER_CAR},
      {key : "CASH_PER_DRIVER", value : this.CASH_PER_DRIVER},
      {key : "WAREHOUSE_POS", value : this.WAREHOUSE_POS}
    ]).subscribe(res => {
      if (res.status.msg)
        this.toastr.error(res.status.msg, 'Error');
      else
        this.toastr.success('Setting is successfully saved!', 'Success');
  this.loadSettings();
    });
  }

  onResetPassword() {
    if (this.password != this.retype){
      this.toastr.error('Password does not match!', 'Password Validation');
      return;
    }
    if (!this.password || !this.retype) {
      this.toastr.error('Password must not be empty!', 'Password Validation');
      return;
    }
    this.userService.changePassword(this.password).subscribe(res => {
      this.toastr.success('Password changed successfully.', 'Password Changed');
    });

  }



}
