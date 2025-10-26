import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGroup } from './create-group';

describe('CreateGroup', () => {
  let component: CreateGroup;
  let fixture: ComponentFixture<CreateGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
