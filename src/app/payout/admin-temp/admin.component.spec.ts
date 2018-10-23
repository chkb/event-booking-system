import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableExpandableRowsComponent } from './admin.component';

describe('AdminComponent', () => {
  let component: TableExpandableRowsComponent;
  let fixture: ComponentFixture<TableExpandableRowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TableExpandableRowsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableExpandableRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
