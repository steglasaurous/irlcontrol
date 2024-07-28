import { TestBed } from '@angular/core/testing';

import { BelaboxWsService } from './belabox-ws.service';

describe('BelaboxWsService', () => {
  let service: BelaboxWsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BelaboxWsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
