import { TestResult } from './TestResult';

export class GroupTestResult{
TestResult:TestResult[];
GroupName:String;
PassItems:number =0;
FailItems:number =0;
Total :number=0;

constructor() {

}
}