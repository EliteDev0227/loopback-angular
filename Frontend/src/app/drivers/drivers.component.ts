import { Component, OnInit, Inject } from '@angular/core';
import { DriversService } from '@app/_services/drivers.service';
import { AuthenticationService } from '@app/_services';
import { Drivers } from '@app/_models/drivers';



import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { UploadService } from '../_services/upload.service';
import { environment } from '@app/_services/environment';
import { UrlWithStringQuery } from 'url';
import { ToastrService } from 'ngx-toastr';

export interface DialogData {
  mode : string;
  driver_id: number;
}



@Component({
  selector: 'app-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.css']
})
export class DriversComponent implements OnInit {
  apiBaseUrl = environment.apiUrl;
  driverList : Drivers[];
  dtOption: any;

  constructor(private authService: AuthenticationService,
    private driversService: DriversService,
    public dialog: MatDialog,
    private toastr: ToastrService) { 
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

  getDriverList(){
    this.driversService.getDrivers().subscribe(res=>{
      this.driverList = res;
    });
  }

  onDeleteDriver(item){
    if (item.order_wallet > 0) {
      this.toastr.warning('Cannot delete driver with money in wallet.', 'Warning');
      return;
    }
    this.driversService.deleteDrivers(item.id).subscribe(res=>{
          this.getDriverList();
    });
  }

  addNewDriver() {
    const dialogRef = this.dialog.open(AddDriverDialog, {
      width: '500px',
      data: {
        mode : 'add'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true)
        this.getDriverList();
    });
  }

  onEditDriver(id : number) {
    const dialogRef = this.dialog.open(AddDriverDialog, {
      width: '500px',
      data: {
        mode : 'edit',
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
  selector: 'add-driver-dialog',
  templateUrl: 'add-driver-dialog.html',
})
export class AddDriverDialog implements OnInit{

  form: FormGroup;
  title : string;
  mode : string;
  
  driver_id : number;
  picture : string;
  password : string;
  form1 : FormGroup;

  old_password : string;
  old_phone : string;

  constructor(
    private formBuilder: FormBuilder, private uploadService: UploadService,
    public dialogRef: MatDialogRef<AddDriverDialog>,
    private driversService: DriversService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      if (data.mode == 'add')
      {
        this.title = "Create New Driver";
      }
      else {
        this.title = "Edit Driver " + data.driver_id;
        this.driver_id = data.driver_id;
        driversService.getDriversById(this.driver_id).subscribe(res =>{
            this.form1.get('name').setValue(res.name);
            this.form1.get('vehicle_type').setValue(res.vehicle_type);
            this.form1.get('phone').setValue(res.phone);
            this.form1.get('salary').setValue(res.salary);
            this.form1.get('bonus').setValue(res.bonus);
            this.form1.get('password').setValue(res.password);
            this.picture = res.picture;
            this.picture_url = environment.apiUrl + "/containers/profile/download/" + res.picture;
            this.old_password = res.password;
            this.old_phone = res.phone;
        });
      }

      this.form1 = this.formBuilder.group({
        name: [],
        vehicle_type: [],
        phone: [],
        salary: [],
        bonus: [],
        password: []
      }); 
    }
  
  onProceed() {
    if (this.form1.invalid)
      return;
    if (this.picture == undefined || this.picture == null || this.picture == "")
      return;
    var driverInfo = {
      name: this.form1.get('name').value,
      vehicle_type: this.form1.get('vehicle_type').value,
      phone: this.form1.get('phone').value,
      salary: this.form1.get('salary').value,
      bonus: this.form1.get('bonus').value,
      password: this.form1.get('password').value,
      picture: this.picture,
    };
    if (this.mode != 'add')
    {
      driverInfo['id'] = this.driver_id;
    }
    var mode = this.mode;
    this.driversService.AddToDrivers(driverInfo).subscribe(res=>{
      if (res != null) {
            this.driversService.changePassword(res.id, res.phone, res.password).subscribe(res=>{

            });
        this.dialogRef.close(true);
      }
      else
        this.dialogRef.close(false);
    });
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      avatar: ['']
    });  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.form.get('avatar').setValue(file);
    }
  }

  uploadResponse : any;
  error : any;
  picture_url : string;

  onSubmit() {
    const formData = new FormData();
    formData.append('file', this.form.get('avatar').value);

    this.uploadService.upload(formData).subscribe(
      (res) => {
        this.uploadResponse = res;
        if (res.result && res.result.files && res.result.files.file && res.result.files.file.length > 0)
        {
          this.picture_url = environment.apiUrl + "/containers/profile/download/" + res.result.files.file[0].name; 
          this.picture = res.result.files.file[0].name;
        }
      },
      (err) => this.error = err
    );
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

}