import { ExpectedResult } from './expectedResult';
import { RowModel } from './rowModel';
import { TestContent } from './testContent';
import {Response} from "./response"

export class TestResult{
    response:any;
    request:any;
    expectedResult:any;
    result:string;
    index:string;
    itemType:string;
    
    constructor() {
        
    }
}