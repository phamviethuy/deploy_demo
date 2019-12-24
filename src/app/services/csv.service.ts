import {Component,OnInit, Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import {Response} from '../models/response'
import { Constant } from '../models/constant';
import {HeaderName} from '../models/HeaderName';
import { RowModel } from '../models/rowModel';
import { TestContent } from '../models/testContent';
import { map } from 'rxjs/operators';
import { stringify } from 'querystring';
import { TestContentConstant } from '../models/testContentConstant';
import { ExpectedResult } from '../models/expectedResult';
import { ExpectedResultConstant } from '../models/expectedResultConstant';
import { NgData } from '../models/NgData';

@Injectable({providedIn: 'root'})
export class CsvService {
    constructor(private httpClient: HttpClient) { }

    convertToObject(rows): RowModel[]{
        let rowsModel = [];
        let temp;
        try {
            for(let i = 0;i<rows[1].length;i++)
            {
            let colIndex = i;
            Constant.Headers.set(colIndex.toString(),rows[1][i]);
            }
            for(let i = 2;i<rows.length;i++)
            {
                try {
                    temp = rows[i];
                    let value = this.convertARow(rows[i],Constant.Headers);
                    rowsModel.push(value);
                } catch (error) {
                     let errorObject = this.getErrorColumnNo(temp,Constant.Headers);
                     errorObject.Type = "fail";
                    rowsModel.push(errorObject);
                }
            }
        } catch (error) {
            let e = error;
        }
        
        return rowsModel;
        
    }
    getErrorColumnNo(row,headers:Map<string,string>):RowModel{
        let rowModel = new RowModel();
        for(let j=0;j<row.length;j++)
        {
          let column = headers.get(j.toString());
          let value = row[j];
          switch (column){
          case HeaderName.No:
            rowModel.No = value;
             break;
            case HeaderName.ItemType:
            rowModel.ItemType = value;
            break;
             default:
             break;
          }
        }
        return rowModel;
    }
    convertARow(row,headers:Map<string,string>):RowModel{
       let rowModel = new RowModel();
        for(let j=0;j<row.length;j++)
        {
          let column = headers.get(j.toString());
          let value = row[j];
          switch (column){
          case HeaderName.No:
            rowModel.No = value;
             break;
            case HeaderName.ItemType:
            rowModel.ItemType = value;
            break;
            case HeaderName.TestContent:
            rowModel.TestContent = this.convertToTestContent(value);
             break;
             case HeaderName.ExpectedResult:
                 rowModel.ExpectedResult = this.convertToExpectedResult(value);
             default:
             break;
          }
        }
        return rowModel;
    }

    convertToTestContent(content:string):TestContent{
        let contents = content.split('\n');
        let testContent = new TestContent();
        let startRequestBody = 0;
        let endRequestBody = 0;
        testContent.RequestBody = "";
        let isStartIndex=false;
        if(content!=null)
        {
            for(let i=0;i<contents.length;i++)
            {
              let value = contents[i];
              value = this.removeSpaces(value).toLowerCase();
              if(value.includes(TestContentConstant.CallApi))
              {
                  testContent.Url = this.removeSpaces(value.split(":")[1]);
                  testContent.Content = this.getContent(i,contents);
              }else if(value.includes(TestContentConstant.Method))
              {
                testContent.Method = value.split(":")[1].replace(" ","");
              }
              else if(value.includes(TestContentConstant.StartRequestBody))
              {
                  if(!isStartIndex)
                  {
                    startRequestBody = i;
                    isStartIndex = true;
                  }
              }else if(value.includes(TestContentConstant.EndRequestBody))
              {
               endRequestBody = i+1;
              }
            }
            for(let i =startRequestBody;i<endRequestBody;i++)
            {
                let value =  this.formatRequestBody(contents[i]);
                testContent.RequestBody = testContent.RequestBody+value;
            }
        }
        testContent.RequestBody = this.removeSlash(testContent.RequestBody);
        return testContent;
    }
    convertToExpectedResult(content:string):ExpectedResult{
        let contents = content.split('\n');

        let result = new ExpectedResult();
        result.Response = new Response();
        result.Response.NgData = new NgData();
        let isStartIndex=false;

        let startResponseBody = 0;
        let endResponeBody = 0;
        let startOkData = 0;
        let endOkData = 0;
        let startNgData = 0;
        let endNg = 0;
        let startErrorObject = 0;
        let endErrorObject = 0;
let isHttpStatus = false;
        if(content!=null)
        {
            for(let i=0;i<contents.length;i++)
            {
              let value = contents[i];
              value = this.removeSpaces(value).toLowerCase();
              let actalValue = this.getValue(value);
              if(!isHttpStatus && value.includes(ExpectedResultConstant.HttpStatus))
              {
                  result.Status = actalValue;
                  isHttpStatus = true;
              }
              else if(value.includes(ExpectedResultConstant.Status))
              {
                result.Response.Status = this.removeDauPhay(actalValue);
              }else if(value.includes(ExpectedResultConstant.OkData))
              {
                let typeOfResult  =actalValue;
                if(typeOfResult == ExpectedResultConstant.EmptyData || typeOfResult == ExpectedResultConstant.NullData)
                {
                    result.Response.OkData = typeOfResult;
                }
                else if(typeOfResult == ExpectedResultConstant.StartData||typeOfResult == ExpectedResultConstant.StartData2){
                            startOkData = i+1;
                }
              }else if(value.includes(ExpectedResultConstant.NgData))
              {
                let typeOfResult  = actalValue;
                if(typeOfResult == ExpectedResultConstant.EmptyData || typeOfResult == ExpectedResultConstant.NullData)
                {
                    result.Response.NgData = null;
                }
                else if(typeOfResult == ExpectedResultConstant.StartData||typeOfResult == ExpectedResultConstant.StartData2){
                            startNgData = i+1;
                }
              }
              else if(value.includes(ExpectedResultConstant.ErrorMessages))
              {
                  let mess = this.removeDauPhay(value.split(":")[1]).trim();
                 let errorMesages = mess;
                 result.Response.NgData.ErrorMessage = errorMesages;
              }
              else if(value.includes(ExpectedResultConstant.ErrorObjects))
              {
                let typeOfResult  = actalValue;
                if(typeOfResult == ExpectedResultConstant.EmptyData || typeOfResult == ExpectedResultConstant.NullData)
                {
                    result.Response.NgData.ErrorObject = null;
                }
                else if(typeOfResult == ExpectedResultConstant.StartData){
                            startErrorObject = i+1;
                }
              }
            }
            if(result.Response.NgData!=null){
                result.Response.NgData.ErrorObject = startErrorObject == 0 ? result.Response.NgData.ErrorObject : this.ConvertErrorObject(startErrorObject,contents);
            }
               result.Response.OkData = startOkData == 0 ? result.Response.OkData: this.ConvertOkData(startOkData,contents);
        }
        return result;
    }
    getValue(string:string)
    {
        let result="";
        if(string.includes(":"))
        {
           result = string.split(':')[1];
        }
        
        if(result.includes(" "))
        {
            result = result.trim();
        }
        result = this.removeDauPhay(result);
        return this.removeSpaces(result);
    }
    ConvertOkData(startIndex,contents):string
    { 
        let result = "";
        for(let i =startIndex;i<contents.length;i++)
        {
            let value =  this.removeSpaces(contents[i]);
            result = result+value+"\n";
            if(contents[i].includes(ExpectedResultConstant.EndData))
            return result;
        }
        return result;
    }
    ConvertErrorMesage(ErrorMessage):string[]
    { 
        let char = String.fromCharCode(34);
        let result = [];
        ErrorMessage = ErrorMessage.replace(char,"");
        let listMess = ErrorMessage.split(" ");
       for(let i=0;i< listMess.length;i++)
       {
           let value = this.removeSpaces(listMess[i])
            result.push(value);
       }

        return listMess;
    }
    ConvertErrorObject(startIndex,contents):string[]
    { 
        let result = [];
        for(let i =startIndex;i<contents.length;i++)
        {
            let value = this.removeSpaces(contents[i]);
            value = this.removeDauPhay(this.removeChar13(value));
           result.push(value);
            if(contents[i+1].includes(ExpectedResultConstant.EndData))
            return result;
        }
        return result;
    }
    removeDauPhay(string:string){
        string =  string.trim();
        return  string.split(',').join('');
      }
      removeSpaces(string):string {
        string = string.split(' ').join('');
       let char = String.fromCharCode(34);
       return string.split(char).join('');
      }

      formatRequestBody(string):string {
        string =  string.trim();
      string = string.split(' ').join('');
     return string.split("\r").join('');
    }
    removeChar92(string:string)
    {
       let char = String.fromCharCode(92);
       return string.split(char).join('');
    }
    removeChar13(string:string)
    {
       let char = String.fromCharCode(13);
       return string.split(char).join('');
    }
    getContent(index,contens)
    {
        let result= "";
        for (let i = 0; i < index; i++) {
            result+=contens[i];
        }
        return result;
    }
    removeSlash(string){
        let char = String.fromCharCode(92);
        string = string.split(92).join('');
       return string.split("\r").join('');
    }
}