import { Component, OnInit, Inject, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { Surveys } from '@app/_models/surveys';
import { SurveysService } from '@app/_services/surveys.service';
import { FormBuilder, FormGroup, DefaultValueAccessor } from '@angular/forms';
import { MatDialogRef, MatDialog, MatSlideToggleChange, MAT_DIALOG_DATA } from '@angular/material';
import { CKEditorComponent } from 'ngx-ckeditor';
import { Answers } from '@app/_models/answers';
import { AnswersService } from '@app/_services/answers.service';
import { ExcelService } from '@app/_services/excel.service';


export interface DialogData {
  survey : Surveys;
  answer_id: number;
  customer_name: string;
}

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css']
})
export class SurveyComponent implements OnInit {
  surveyList : Surveys[];
  dtOption : any;

  constructor(
    private surveysService : SurveysService,
    private answersService : AnswersService,
    private excelService : ExcelService,
    public dialog: MatDialog
  ) {
    this.getSurveyList();

   }
  
  getSurveyList() {
    this.surveysService.getSurveys().subscribe(res => {
      this.surveyList = res;
    })
  }

  addNewSurvey() {
    const dialogRef = this.dialog.open(AddSurveyDialog, {
      width: '800px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getSurveyList();
      }
    });
  }

  onRemoveSurvey(survey : Surveys) {
    this.surveysService.deleteSurveys(survey.id).subscribe(res => {
      this.getSurveyList();
    })
  }

  onEnterSurvey(survey : Surveys) {
    const dialogRef = this.dialog.open(ViewSurveyDialog, {
      width: '800px',
      data : {survey : survey}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getSurveyList();
      }
    });
  }

  onDownloadResults(survey : Surveys) {
    this.answersService.getAnswersBySurveyId(survey.id).subscribe(res => {
      var questions = survey.questions;
      var start = 0;
      var problems = [];
      while (1) {
        var pos = questions.indexOf("<p>", start);
        if (pos < 0)
          break;
        start = pos + 3;
        if (questions.substr(pos+3, 6) != '<input') {
          var end_pos = questions.indexOf("</p>", start);
          start = end_pos;
          var probStr = questions.substr(pos+3, end_pos - pos - 3);
          problems.push(probStr);
        }
      }
      console.log(problems);

      for (var i = 0; i < res.length; i++) {
//        res[i]["questions"] = this.survey.questions;
        if (!res[i].answer)
          continue;
        var answers = JSON.parse(res[i].answer);
        if (!answers && answers.length == 0)
          continue;


        for (var j = 0; j < problems.length; j++) {
          res[i][problems[j]] = '';
            for(var k = 0; k < answers.length; k++) {
              if (answers[k].name.indexOf((j+1)) >= 0) {
                if (((answers[k].type == "radio" || answers[k].type == "checkbox") && answers[k].checked)) {
                  res[i][problems[j]] += answers[k].value + " ";
                }
                if (answers[k].type == "text") {
                  res[i][problems[j]] += answers[k].value;
                }
              }
            }
        }
        
        res[i].answer = null;
      }
      this.excelService.exportAsExcelFile(res, "Survey Results");

    })
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

}


@Component({
  selector: 'add-survey-dialog',
  templateUrl: 'add-survey-dialog.html',
})
export class AddSurveyDialog {
  
  ckEditorConfig: {} = 
    {
        "toolbarGroups": [
              // { "name": "document", "groups": [ "mode", "document", "doctools" ] },
              // { "name": "editing", "groups": [ "find", "selection", "spellchecker", "editing" ] },
              { "name": "forms", "groups": [ "forms" ] }
          ],
          "removeButtons":"Source,Save,Templates,Find,Replace,Scayt,SelectAll"
         
    };

  public editorValue: string = '';

  form : FormGroup;

  constructor(
    private surveysService : SurveysService,
    public dialogRef: MatDialogRef<AddSurveyDialog>,
    private formBuilder : FormBuilder) {
      this.form = this.formBuilder.group({
        name : "",
        order_min : 0,
        order_max : 0,
        survey_min : 0,
        survey_max : 0,
        exchange_min : 0,
        exchange_max : 0,
        refund_min : 0,
        refund_max : 0,
        value_min : 0,
        value_max : 0,
        promo_name : "",
        promo_description : "",
        promo_code : "",
        editorValue : "",
        after_type : 1,
      });
    }

  onToggleRefund(event: MatSlideToggleChange) {
    if (!event.checked)
    {
      this.form.get('refund_min').setValue(0);
      this.form.get('refund_max').setValue(0);
      this.form.get('refund_min').disable();
      this.form.get('refund_max').disable();
    }
    else
    {
      this.form.get('refund_min').enable();
      this.form.get('refund_max').enable();
    }
  }

  onToggleExchange(event: MatSlideToggleChange) {
    if (!event.checked)
    {
      this.form.get('exchange_min').setValue(0);
      this.form.get('exchange_max').setValue(0);
      this.form.get('exchange_min').disable();
      this.form.get('exchange_max').disable();
    }
    else
    {
      this.form.get('exchange_min').enable();
      this.form.get('exchange_max').enable();
    }
  }

  onCreate() {
    if (this.form.invalid)
    {
      return;
    }
    this.surveysService.AddToSurveys({
      name : this.form.get('name').value,
      questions : this.form.get('editorValue').value,
      order_min : this.form.get('order_min').value,
      order_max : this.form.get('order_max').value,
      survey_min : this.form.get('survey_min').value,
      survey_max : this.form.get('survey_max').value,
      exchange_min : this.form.get('exchange_min').value,
      exchange_max : this.form.get('exchange_max').value,
      refund_min : this.form.get('refund_min').value,
      refund_max : this.form.get('refund_max').value,
      value_min : this.form.get('value_min').value,
      value_max : this.form.get('value_max').value,
      promo_name : this.form.get('promo_name').value,
      promo_description : this.form.get('promo_description').value,
      promo_code : this.form.get('promo_code').value,
      after_type : this.form.get('after_type').value,
    }).subscribe(res => {
      this.dialogRef.close(true);

    });
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

}

@Component({
  selector: 'view-survey-dialog',
  templateUrl: 'view-survey-dialog.html',
})
export class ViewSurveyDialog {
  survey : Surveys;
  answerList : Answers[];
  status_str : any;

  constructor(
    private answersService : AnswersService,
    private excelService : ExcelService,
    private surveysService : SurveysService,
    public dialogRef: MatDialogRef<ViewSurveyDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private formBuilder : FormBuilder,
    public dialog: MatDialog) {
      this.survey = data.survey;
      this.status_str = [];
      this.status_str[0] = "Not Answered";
      this.status_str[1] = "Answered";
      this.getAnswerList();
    }

  getAnswerList() {
    this.answersService.getAnswersBySurveyId(this.survey.id).subscribe(res => {
      this.answerList = res;

    })
  }

  onFillAnswer(answer_id : number, customer_name : string) {
    const dialogRef = this.dialog.open(FillAnswerDialog, {
      width: '600px',
      data : {survey : this.survey, answer_id : answer_id, customer_name : customer_name}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAnswerList();
      }
    });
  }


  onNoClick(): void {
    this.dialogRef.close(false);
  }

}


@Component({
  selector: 'fill-answer-dialog',
  templateUrl: 'fill-answer-dialog.html',
})
export class FillAnswerDialog implements OnInit{
  ngOnInit(): void {
    this.getQuestion();
  }

  survey : Surveys;
  answer_id : number;
  customer_name : string;
  questions : string;
  content : string;

  
  constructor(
    private surveysService : SurveysService,
    private answersService : AnswersService,
    public dialogRef: MatDialogRef<FillAnswerDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private formBuilder : FormBuilder,
    private render : Renderer2,
    private elementRef:ElementRef) {
      this.survey = data.survey;
      this.answer_id = data.answer_id;
      this.customer_name = data.customer_name;
    }

  getQuestion() {
      this.questions = this.survey.questions;
      var d1 = this.elementRef.nativeElement.querySelector('#question_holder');
      d1.insertAdjacentHTML('beforeend', this.questions);

      this.answersService.getAnswersById(this.answer_id).subscribe(res => {
        if (res.status == 0)
          return;
  
        var answers = JSON.parse(res.answer);
        for (var i = 0; i < answers.length; i++) {
          var d1;
          if (answers[i].type == "text"){
            d1 = this.elementRef.nativeElement.querySelector("input[name='" + answers[i].name + "']");
            d1.value = answers[i].value;
          }
          else {
            d1 = this.elementRef.nativeElement.querySelector("input[name='" + answers[i].name + "'][value='"+answers[i].value+"']");
            d1.checked = answers[i].checked;
          }
        }
      })
  }

  onSubmit() {
    return true;
  }

  onSaveAnswer( ) {
    var d1 = this.elementRef.nativeElement.querySelector('#question_holder');
    var d2 = this.elementRef.nativeElement.querySelectorAll('#question_holder input');
    var answers = [];
    for (var i = 0; i < d2.length; i++)
    {
      var ans = {
        type : d2[i].type,
        name : d2[i].name,
        value : d2[i].value
      };

      if (d2[i].type == "checkbox" || d2[i].type == "radio" )
      {
        ans['checked'] = d2[i].checked;
      }
      answers.push(ans);
    }
    this.answersService.saveAnswer(this.answer_id, JSON.stringify(answers)).subscribe(res => {
        this.dialogRef.close(true);
    });
  }
  onNoClick(): void {
    this.dialogRef.close(false);
  }

}