import { EventEmitter, Injectable } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { BehaviorSubject } from 'rxjs';
import { OrderDetails, PersonalData } from '../models/ubs.interface';

@Injectable({
  providedIn: 'root'
})
export class UBSOrderFormService {
  orderDetails: OrderDetails;
  personalData: PersonalData;
  orderUrl: string;
  orderStatusDone = false;
  errorOccurred = false;
  changedOrder: any = new EventEmitter();
  changedPersonalData: any = new EventEmitter();
  isDataSaved = false;
  locations: any;
  locationId: any;

  private orderID = new BehaviorSubject(null);
  orderId = this.orderID.asObservable();

  constructor(private localStorageService: LocalStorageService) {}

  transferOrderId(id: any) {
    this.orderID.next(id);
  }

  changeOrderDetails() {
    this.changedOrder.emit(this.orderDetails);
  }

  changePersonalData() {
    this.changedPersonalData.emit(this.personalData);
  }

  changeOrderStatus(orderStatus: boolean) {
    this.orderStatusDone = orderStatus;
  }

  getOrderStatus(): boolean {
    return this.orderStatusDone;
  }

  setOrderStatus(orderStatus: boolean): void {
    this.orderStatusDone = orderStatus;
  }

  getOrderResponseErrorStatus(): boolean {
    return this.errorOccurred;
  }

  setOrderResponseErrorStatus(errorStatus: boolean): void {
    this.errorOccurred = errorStatus;
    if (errorStatus) {
      this.orderStatusDone = false;
    }
  }

  saveDataOnLocalStorage() {
    if (!this.isDataSaved) {
      const personalData = JSON.stringify(this.getPersonalData());
      const orderData = JSON.stringify(this.getOrderDetails());
      this.localStorageService.setUbsOrderData(personalData, orderData);
    } else {
      this.localStorageService.removeUbsOrderData();
    }
  }

  getPersonalData() {
    return this.personalData;
  }

  getOrderDetails() {
    return this.orderDetails;
  }
}
