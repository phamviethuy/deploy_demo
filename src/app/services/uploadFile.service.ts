import {Component,OnInit, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})

export class UpLoadFileService{

    constructor(private http:HttpClient) {}
    uploadImage(image:File, fileName:string){
        const url = "http://localhost:51412/api/uploadImage";
        const formData = new FormData();
        formData.append("photo",image);
        formData.append("fileName",fileName)
        return this.http.post(url,formData);
    }
}