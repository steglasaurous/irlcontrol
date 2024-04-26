import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusOverlayComponent } from './status-overlay.component';

describe('StatusOverlayComponent', () => {
  let component: StatusOverlayComponent;
  let fixture: ComponentFixture<StatusOverlayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatusOverlayComponent]
    });
    fixture = TestBed.createComponent(StatusOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
