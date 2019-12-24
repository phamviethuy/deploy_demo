import {Component,OnInit, Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vegetable } from '../models/vegetable';
import { Department } from '../models/department';

@Injectable({providedIn: 'root'})
export class VegetableService {
    constructor(private httpClient: HttpClient) { }
    getAllEmployees(): Observable<Vegetable[]>{
        let url = "http://phamhuy9x-001-site1.htempurl.com/api/vegetable/get";
        return this.httpClient.get<Vegetable[]>(url);
    }
//     getcontactPreference(): Observable<string[]>{
//         let url = "http://localhost:51412/api/contactPreferences";
//         return this.httpClient.get<string[]>(url);
//     }
//     getDepartments(): Observable<Department[]>{
//         let url = "http://localhost:51412/api/departments";
//         return this.httpClient.get<Department[]>(url);
//     }
//     createEmployee(employee:Employee) :  Observable<Employee>{
//         let url = "http://localhost:51412/api/createEmployee";
//         return this.httpClient.post<Employee>(url,employee);
//     }
//     deleteEmployee(id) : Observable<void>{
//         let url = "http://localhost:51412/api/deleteEmloyee/"+id;;
//         return this.httpClient.delete<void>(url);
//     }
//    editEmployee(employee:Employee) : Observable<void> {
//     let url = "http://localhost:51412/api/editEmployee";
//     return this.httpClient.put<void>(url,employee);
//     }
    
}