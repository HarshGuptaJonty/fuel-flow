import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UserDetailsComponent } from './user-details.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Customer } from '../../../assets/models/Customer';

describe('UserDetailsComponent', () => {
  let component: UserDetailsComponent;
  let fixture: ComponentFixture<UserDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatButtonModule,
        UserDetailsComponent
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.userObject = {
      data: {
        fullName: 'testData',
        phoneNumber: '1234567890',
        userId: 'qwerty'
      },
      others: {
        createdTime: Date.now()
      }
    } as Customer;
    component.ngOnChanges();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize data on ngOnChanges', () => {
    component.userObject = {
      data: {
        fullName: 'testData',
        phoneNumber: '1234567890',
        userId: 'qwerty'
      },
      others: {
        createdTime: Date.now()
      }
    } as Customer;
    component.ngOnChanges();
    expect(component.data).toEqual({
      fullName: 'testData',
      phoneNumber: '1234567890',
      userId: 'qwerty'
    });
    expect(component.others).toEqual({
      createdTime: jasmine.any(Number)
    });
    expect(component.computedData.createdOn).toBeDefined();
  });

  it('should emit onProfileEdit event on editProfile method', () => {
    spyOn(component.onProfileEdit, 'emit');
    component.editProfile();
    expect(component.onProfileEdit.emit).toHaveBeenCalled();
  });
});