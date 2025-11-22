import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundManage } from './round-manage';

describe('RoundManage', () => {
  let component: RoundManage;
  let fixture: ComponentFixture<RoundManage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundManage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoundManage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
