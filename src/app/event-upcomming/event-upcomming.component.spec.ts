import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventUpcommingComponent } from './event-upcomming.component';


describe('EventUpcommingComponent', () => {
  let component: EventUpcommingComponent;
  let fixture: ComponentFixture<EventUpcommingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EventUpcommingComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventUpcommingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
