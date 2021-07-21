import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BunscoilComponent } from './bunscoil.component';

describe('BunscoilComponent', () => {
  let component: BunscoilComponent;
  let fixture: ComponentFixture<BunscoilComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BunscoilComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BunscoilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
