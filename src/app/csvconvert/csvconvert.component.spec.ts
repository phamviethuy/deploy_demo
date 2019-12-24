import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvconvertComponent } from './csvconvert.component';

describe('CsvconvertComponent', () => {
  let component: CsvconvertComponent;
  let fixture: ComponentFixture<CsvconvertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsvconvertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsvconvertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
