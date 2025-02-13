import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ConfirmationModel } from '../../assets/models/ConfirmationModel';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationModelService {

  private confirmationModelData = new BehaviorSubject<any>(null);
  confirmationModelData$ = this.confirmationModelData.asObservable();

  onButtonClick = new Subject<any>();

  CUSTOM_CLASS = {
    GREY: 'grey-btn',
    GREY_BLUE: 'grey-btn-blue',
    GREY_RED: 'grey-btn-red'
  }

  showModel(data: ConfirmationModel) {
    this.confirmationModelData.next(data);
    return this.onButtonClick;
  }

  hideModel() {
    this.confirmationModelData.next(null);
  }
}
