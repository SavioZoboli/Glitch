import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateAccount } from './update-account';

describe('UpdateAccount', () => {
  let component: UpdateAccount;
  let fixture: ComponentFixture<UpdateAccount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateAccount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateAccount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
