import { Component, OnInit, Output } from '@angular/core';
import readXlsxFile from 'read-excel-file'
import { CsvService } from '../services/csv.service';
import { ApiService } from '../services/api.service';
import { RowModel } from '../models/rowModel';
import { ExpectedResult } from '../models/expectedResult';
import { TestResult } from '../models/TestResult';
import { Response } from '../models/response';
import { isString } from 'util';
import { NgData } from '../models/NgData';
import * as XLSX from 'xlsx';
import { distinct } from 'rxjs/operators';
import { GroupTestResult } from '../models/groupTestResult';

@Component({
  selector: 'app-csvconvert',
  templateUrl: './csvconvert.component.html',
  styleUrls: ['./csvconvert.component.css']
})
export class CsvconvertComponent implements OnInit {

  constructor(private csvService:CsvService,private apiService:ApiService) { }
  objectsSheet:Array<RowModel[]>=[];
  files:FileList;
  isConverted:boolean;
  totalResponse:Array<TestResult> = [];
  arrayBuffer:any;
  dowloadFile : any[]=[];
  convertStatus:string;
  sendRequestfailList : any[] = [];
  sendRequestStatus:string;
  passItems:string= "0";
  failItems:string = "0";
  groupResponseMapping:Map<TestResult,string> = new Map<TestResult,string>();
  groupResponse:GroupTestResult[]=[];
  listItems : Map<string,number> = new Map<string,number>();
  ngOnInit() {
    this.isConverted = true;
  }
data:any;
incomingfile(event) 
  {
    this.files = event.target.files;
    this.isConverted = false;
    this.convertStatus= "";
    let failItems = [];
    for (let index = 0; index < this.files.length; index++) {
      readXlsxFile(this.files[index]).then((rows) => {
        console.log(rows);
        this.objectsSheet.push(this.csvService.convertToObject(rows));
        this.listItems.set(this.objectsSheet[index][0].TestContent.Url,this.objectsSheet[index].length);
        failItems = this.objectsSheet[0].filter(p=> p.Type == "fail");

        if(failItems.length>0){
        this.convertStatus = "Convert fail " +this.objectsSheet.length+"/"+(rows.length-2) + " at item :";
        failItems.forEach(element => {
          this.convertStatus+=element.No +",";
        });
        failItems = [];
        }
        else{
          this.convertStatus  = "Convert Ok";
        }

        this.isConverted = true;
        console.log(this.objectsSheet);
      })
    }
  }
  Clear()
  {
    this.totalResponse = [];
    this.objectsSheet = [];
    this.files =null;
    this.convertStatus = "";
    this.passItems = "0";
    this.failItems = "0";

  }
  caculateRate(result:TestResult[],groupResponse:GroupTestResult[])
  {
    this.passItems = result.filter(p=>p.result == "Pass").length.toString();
    this.failItems = result.filter(p=>p.result == "Fail").length.toString();
    groupResponse.forEach(element => {
      let total = this.listItems.get(element.GroupName.toString());
      element.Total = total;
      element.PassItems= element.TestResult.filter(p=>p.result == "Pass").length
      element.FailItems = element.TestResult.filter(p=>p.result == "Fail").length
    });
  }
  listExpectedRequest(rows:RowModel[]){
    rows.forEach(r=>{
      this.sendRequestfailList.push(r.No.toString());
    })
  }
  listRequestDone(no){
    this.sendRequestfailList= this.sendRequestfailList.filter(r=>r!=no);
    this.sendRequestStatus = "Missing case: "
if(this.sendRequestStatus.length>0)
{

  this.sendRequestfailList.forEach(element => {
    this.sendRequestStatus += element+"-";
  });
}
else{
  this.sendRequestStatus += "none";
}
  }
  Start(){

    let list = [];
    for (let index = 0; index < this.objectsSheet.length; index++) {
      let rows = this.objectsSheet[index];
      this.listExpectedRequest(rows);
      for(let i=0;i<rows.length;i++)
    {
    try {
  let result = new TestResult();
  this.apiService.SendRequest(rows[i].TestContent,i)
      .subscribe(res=>{
        console.log(res);
        result.response = res;
        result.itemType = rows[i].ItemType;
        result.request = rows[i].TestContent;
        result.index = rows[i].No.toString() ;
        result.expectedResult =  rows[i].ExpectedResult;
        result.result = this.isPassed(result.response,result.expectedResult) ? "Pass":"Fail";

        result.request.ViewRequestBody = JSON.stringify(JSON.parse(result.request.RequestBody),undefined, 4);// JSON.stringify( result.request.RequestBody, undefined, 2);

        result.response.OkDataView = JSON.stringify(result.response.OkData, undefined, 4);
        result.response.NgDataView = JSON.stringify(result.response.NgData, undefined, 4);

        result.expectedResult.Response.OkDataView = JSON.stringify(result.expectedResult.Response.OkData, undefined, 4);
        result.expectedResult.Response.NgDataView = JSON.stringify( result.expectedResult.Response.NgData, undefined, 4);

        this.totalResponse.push(result);
        if(this.groupResponse.length>0)
        {
          let exitsResult = this.groupResponse.filter(p=>p.GroupName == result.request.Url);
          let i = this.getIndexOfGroup(result);
         
          if(exitsResult.length>0 )
          {
            this.groupResponse[i].TestResult.push(result);
          }else{
          let testResults = new GroupTestResult();
          testResults.TestResult = [];
          testResults.TestResult.push(result);
          testResults.GroupName = result.request.Url;
          this.groupResponse.push(testResults);
          }
        }
        else{
          let testResults = new GroupTestResult();
          testResults.TestResult = [];
          testResults.TestResult.push(result);
          testResults.GroupName = result.request.Url;
          this.groupResponse.push(testResults);
        }
        
        this.listRequestDone( result.index);
        this.caculateRate(this.totalResponse,this.groupResponse);
      });
    } catch (error) {
     console.log(error);
    }
    }
    }
    
  }
  getIndexOfGroup(result):number
  {
    let i=0;
    this.groupResponse.forEach(p=>{
      if(p.GroupName == result.request.Url)
      {
        return i;
      }
      else{
        i++;
      }
    })
    return i;
  }
  isPassed(response:Response,expected:ExpectedResult):boolean
  {

    let isPassed = true;
    try {

    if(response.Status.toLowerCase() != expected.Response.Status)
    isPassed = false;
    let okData = response.OkData == null ? "null":response.OkData;
    okData = JSON.parse(okData)
    if(okData != JSON.parse(expected.Response.OkData))
    isPassed = false;
    let ngData = response.NgData == null ? "null":response.NgData;
    let expectedngData = expected.Response.NgData == null? "null" :expected.Response.NgData;
    if(ngData != "null")
    {
      response.NgData.ErrorMessage = response.NgData.ErrorMessage.toLowerCase();
      let atterngData = response.NgData
      if(this.csvService.removeSpaces(atterngData.ErrorMessage) != expected.Response.NgData.ErrorMessage)
      isPassed =false;
      if(atterngData.ErrorObject != expected.Response.NgData.ErrorObject)
      {
        for (let index = 0; index < atterngData.ErrorObject.length; index++) {
          if(atterngData.ErrorObject[index]!= this.csvService.removeDauPhay(expected.Response.NgData.ErrorObject[index]))
          isPassed = false;
        }
      }
    }else
    {
      if(ngData != expectedngData)
      isPassed = false;
    }
    } catch (error) {
      isPassed = false;
    }
    
    return isPassed;
  }
}
