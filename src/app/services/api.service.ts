import {Component,OnInit, Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpectedResult } from '../models/expectedResult';
import { TestContent } from '../models/testContent';
import { Constant } from '../models/constant';
import {Response} from "../models/response"

@Injectable({providedIn: 'root'})

export class ApiService{

    constructor(private httpClient:HttpClient) {}
    SendRequest(request:TestContent,index:number): Observable<Response>{

        let headers: HttpHeaders = new HttpHeaders();
        headers.append("Content-Type","application/json");
        
        let i = index;
        let url = request.Url;
        let body =  JSON.parse(request.RequestBody);
        return this.httpClient.post<Response>(url,body,{headers});
    }
}