import { Component, OnInit, Inject } from '@angular/core';
import { ZonesService } from '@app/_services/zones.service';
import { Zones } from '@app/_models/zones';
import { AuthenticationService } from '@app/_services';
import { AreasService } from '@app/_services/areas.service';


import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Areas } from '@app/_models/Areas';

export interface DialogData {
  zone_id: number;
  zone_name: string;
  area: any;
  mode: string;
}

@Component({
  selector: 'app-zones',
  templateUrl: './zones.component.html',
  styleUrls: ['./zones.component.css']
})
export class ZonesComponent implements OnInit {
  zonesList : Zones[];
  dtOption : any;
  
  ngOnInit() {
    this.dtOption = {
      dom: 'l<"float-right"B>frtip',
      displayLength: 100,
      "buttons": [
        'excel'
      ]
    };
  }


  addAreaToZone(zone_id, zone_name): void {
    const dialogRef = this.dialog.open(AddAreaDialog, {
      width: '400px',
      data: {zone_id: zone_id, zone_name: zone_name}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true)
        this.getZonesList();
    });
  }

  addNewZone() {
    const dialogRef = this.dialog.open(AddZoneDialog, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true)
        this.getZonesList();
    });
  }

  constructor(
    private zonesService: ZonesService,
    private authService: AuthenticationService,
    public dialog: MatDialog
  ) { 
    this.getZonesList();

  }

  getZonesList(){
    let user = this.authService.currentUserValue;
    if(user){
      this.zonesService.getZones().subscribe(res=>{
        for (var i = 0; i < res.length; i++)
        {
          var areaString = "";
          for(var j = 0; j < res[i].areas.length; j++)
          {
            areaString += res[i].areas[j].name;
            if (j != res[i].areas.length - 1)
              areaString += ", ";
          }
          res[i].areaString = areaString;
        }
        this.zonesList = res;
      });
    }else{
      if(localStorage.getItem("zonesList") === null){
        return;
      }else{
        var localStorageItem = localStorage.getItem("zonesList");
        var localStorageExtend : Zones[] = JSON.parse(localStorageItem);
        if(localStorageExtend.length > 0){
          this.zonesList = localStorageExtend;
        }else{
         return;
        }
      }
    }
  }

  onEditZone(id: number, name : string) {
    const dialogRef = this.dialog.open(EditZoneDialog, {
      width: '600px',
      data: {zone_id: id, zone_name: name}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true)
        this.getZonesList();
    });
  }

  onDeleteZone(id: number){
    this.zonesService.deleteZones(id).subscribe(res=>{
      this.getZonesList();
    });
  }


}


@Component({
  selector: 'edit-zone-dialog',
  templateUrl: 'edit-zone-dialog.html',
})
export class EditZoneDialog {
  zone_id : number;
  zone_name : string;
  areaList : Areas[];

  constructor(
    public dialogRef: MatDialogRef<AddAreaDialog>,
    private areasService: AreasService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public dialog: MatDialog,
      private formBuilder : FormBuilder) {
      this.zone_id = data.zone_id;
      this.zone_name = data.zone_name;

      this.getAreaList();
    }
  
  onProceed() {
  }

  getAreaList() {
    this.areasService.getAreasByZoneId(this.zone_id).subscribe(res => {
      this.areaList = res;
    })
  }

  onAddArea() {
    const dialogRef = this.dialog.open(AddAreaDialog, {
      width: '400px',
      data: {mode: 'ADD', zone_id: this.zone_id, zone_name: this.zone_name}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true)
        this.getAreaList();
    });
  }

  onEditArea(item : any) {
    const dialogRef = this.dialog.open(AddAreaDialog, {
      width: '400px',
      data: {mode: 'EDIT', zone_id: this.zone_id, zone_name: this.zone_name, area : item}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true)
        this.getAreaList();
    });
  }

  onDeleteArea(id : number) {
    this.areasService.deleteAreas(id).subscribe(res => {
      this.getAreaList();
    })
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

}

@Component({
  selector: 'add-area-dialog',
  templateUrl: 'add-area-dialog.html',
})
export class AddAreaDialog {
  zone_id : number;
  zone_name : string;
  mode: string;
  areaItem : any;
  form : FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddAreaDialog>,
    private areasService: AreasService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
      private formBuilder : FormBuilder) {

      this.zone_id = data.zone_id;
      this.zone_name = data.zone_name;
      this.mode = data.mode;
      if (this.mode == 'EDIT') {
        this.areaItem = data.area;
        this.form = this.formBuilder.group({
          id : data.area.id,
          name: data.area.name,
          google_pin: data.area.google_pin,
        });
      }
      else {
        this.form = this.formBuilder.group({
          id : null,
          name: [],
          google_pin: [],
        });
      }
      
    }
  
  onProceed() {
    if (this.form.invalid)
      return;
    this.areasService.AddToAreas({
      id: this.form.get('id').value,
      name: this.form.get('name').value,
      google_pin: this.form.get('google_pin').value,
      zone_id: this.zone_id
    }).subscribe(res=>{
      if (res != null)
        this.dialogRef.close(true);
      else
        this.dialogRef.close(false);
    });
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

}


@Component({
  selector: 'add-zone-dialog',
  templateUrl: 'add-zone-dialog.html',
})
export class AddZoneDialog {
  form : FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddZoneDialog>,
    private zonesService: ZonesService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private formBuilder : FormBuilder) {
      this.form = this.formBuilder.group({
        name: [],
        google_pin: [],
      });
    }
  
  onProceed() {
    if (this.form.invalid)
      return;
    this.zonesService.AddToZones({
      name: this.form.get('name').value,
      google_pin: this.form.get('google_pin').value
    }).subscribe(res=>{
      if (res != null)
        this.dialogRef.close(true);
      else
        this.dialogRef.close(false);
    });
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

}