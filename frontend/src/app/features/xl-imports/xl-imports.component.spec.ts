import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XlImportsComponent } from './xl-imports.component';

describe('XlImportsComponent', () => {
  let component: XlImportsComponent;
  let fixture: ComponentFixture<XlImportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XlImportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XlImportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
