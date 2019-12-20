import { TestBed } from '@angular/core/testing';

import { LabelsInfoService } from './labels-info.service';

describe('LabelsInfoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LabelsInfoService = TestBed.get(LabelsInfoService);
    expect(service).toBeTruthy();
  });
});
