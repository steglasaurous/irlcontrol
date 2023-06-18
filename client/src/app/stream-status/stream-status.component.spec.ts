import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamStatusComponent } from './stream-status.component';

describe('StreamStatusComponent', () => {
  let component: StreamStatusComponent;
  let fixture: ComponentFixture<StreamStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StreamStatusComponent]
    });
    fixture = TestBed.createComponent(StreamStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
