import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListGroup } from './list-group';

describe('ListGroup', () => {
  let component: ListGroup;
  let fixture: ComponentFixture<ListGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
