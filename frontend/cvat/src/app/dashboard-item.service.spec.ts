import { TestBed } from '@angular/core/testing';

import { DashboardItemService } from './dashboard-item.service';

describe('DashboardItemService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DashboardItemService = TestBed.get(DashboardItemService);
    expect(service).toBeTruthy();
  });
});
