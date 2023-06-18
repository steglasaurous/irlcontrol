import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IrlStatsComponent } from './irl-stats.component';

describe('IrlStatsComponent', () => {
  let component: IrlStatsComponent;
  let fixture: ComponentFixture<IrlStatsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IrlStatsComponent]
    });
    fixture = TestBed.createComponent(IrlStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
