import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { OrderService } from '../../../services/order.service';
import { Subject } from 'rxjs';
import { CertificateStatus } from '../../../certificate-status.enum';
import { Bag, Locations, OrderDetails } from '../../../models/ubs.interface';
import { UBSOrderFormService } from '../../../services/ubs-order-form.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';

@Component({
  selector: 'app-ubs-order-certificate',
  templateUrl: './ubs-order-certificate.component.html',
  styleUrls: ['./ubs-order-certificate.component.scss']
})
export class UbsOrderCertificateComponent implements OnInit, OnDestroy {
  @Input() showTotal;
  @Input() bags: Bag[];
  @Input() defaultPoints: number;
  @Input() points: number;
  @Input() pointsUsed: number;
  @Output() newItemEvent = new EventEmitter<object>();
  fullCertificate: number;
  orders: OrderDetails;
  orderDetailsForm: FormGroup;
  certStatuses = [];
  minOrderValue = 500;
  certificates = [];
  certificateSum = 0;
  total = 0;
  finalSum = 0;
  cancelCertBtn = false;
  displayMinOrderMes = false;
  displayCert = false;
  addCert = false;
  onSubmit = true;
  order: {};
  certificateMask = '0000-0000';
  ecoStoreMask = '0000000000';
  servicesMask = '000';
  certificatePattern = /(?!0000)\d{4}-(?!0000)\d{4}/;
  commentPattern = /^[i\s]{0,255}(.){0,255}[i\s]{0,255}$/;
  additionalOrdersPattern = /^\d{10}$/;
  certSize = false;
  showCertificateUsed = 0;
  certificateLeft = 0;
  certDate: string;
  certStatus: string;
  failedCert = false;
  object: {};
  private destroy: Subject<boolean> = new Subject<boolean>();
  public certificateError = false;
  bonusesRemaining: boolean;
  public locations: Locations[];
  clickOnYes = true;
  clickOnNo = true;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private shareFormService: UBSOrderFormService,
    private localStorageService: LocalStorageService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    localStorage.removeItem('UBSorderData');
    this.orderService.locationSubject.pipe(takeUntil(this.destroy)).subscribe(() => {
      if (this.localStorageService.getUbsOrderData()) {
        this.calculateTotal();
      }
    });
  }

  disableAddCertificate() {
    return this.certificates.length === this.formArrayCertificates.length;
  }

  initForm() {
    this.orderDetailsForm = this.fb.group({
      bonus: new FormControl('no'),
      formArrayCertificates: this.fb.array([new FormControl('', [Validators.minLength(8), Validators.pattern(this.certificatePattern)])])
    });
  }

  get formArrayCertificates() {
    return this.orderDetailsForm.get('formArrayCertificates') as FormArray;
  }

  private certificateDateTreat(date: string) {
    return date.split('-').reverse().join('-');
  }

  setNewValue(value: object) {
    this.newItemEvent.emit(value);
  }

  sendDataToParents() {
    const certificateObj = {
      showCertificateUsed: this.showCertificateUsed,
      certificateSum: this.fullCertificate,
      displayCert: this.displayCert,
      finalSum: this.finalSum,
      pointsUsed: this.pointsUsed,
      points: this.points,
      isBonus: this.orderDetailsForm.get('bonus').value
    };
    this.setNewValue(certificateObj);
  }

  certificateMatch(cert): void {
    if (cert.certificateStatus === CertificateStatus.ACTIVE || cert.certificateStatus === CertificateStatus.NEW) {
      this.certificateSum += cert.certificatePoints;
      this.displayCert = true;
      this.addCert = true;
    }
    this.failedCert = cert.certificateStatus === CertificateStatus.EXPIRED || cert.certificateStatus === CertificateStatus.USED;
    this.certificateSum = this.failedCert && this.formArrayCertificates.length === 1 ? 0 : this.certificateSum;
    this.certDate = this.certificateDateTreat(cert.certificateDate);
    this.certStatus = cert.certificateStatus;
    this.fullCertificate = this.certificateSum;
  }

  private calculateTotal(): void {
    this.total = 0;
    this.bags.forEach((bag) => {
      this.total += bag.price * bag.quantity;
    });
    this.showTotal = this.total;
    this.displayMinOrderMes = this.total < this.minOrderValue && this.orderDetailsForm.dirty;
    this.onSubmit = this.displayMinOrderMes;
    this.finalSum = this.total - this.pointsUsed;
    if (this.certificateSum > 0) {
      if (this.total > this.certificateSum) {
        this.certificateLeft = 0;
        if (this.finalSum <= this.certificateSum && this.pointsUsed > 0) {
          this.points = this.pointsUsed - this.finalSum;
          this.pointsUsed = this.finalSum;
          this.finalSum = 0;
        } else {
          this.finalSum = this.total - this.certificateSum - this.pointsUsed;
        }
        this.showCertificateUsed = this.certificateSum;
      } else {
        this.finalSum = 0;
        this.points = this.points + this.pointsUsed;
        this.pointsUsed = 0;
        this.orderDetailsForm.controls.bonus.setValue('no');
        this.certificateLeft = this.certificateSum - this.total;
        this.showCertificateUsed = this.total;
      }
      this.bonusesRemaining = this.certificateSum > 0;
    } else {
      this.certificateLeft = 0;
      this.finalSum = this.total - this.certificateSum - this.pointsUsed;
      this.showCertificateUsed = this.certificateSum;
    }
    this.sendDataToParents();
    this.changeOrderDetails();
  }

  changeOrderDetails() {
    this.shareFormService.orderDetails.pointsToUse = this.pointsUsed;
    this.shareFormService.orderDetails.certificates = this.certificates;
    this.shareFormService.orderDetails.certificatesSum = this.showCertificateUsed;
    this.shareFormService.orderDetails.pointsSum = this.pointsUsed;
    this.shareFormService.orderDetails.total = this.showTotal;
    this.shareFormService.orderDetails.finalSum = this.finalSum;
    this.shareFormService.changeOrderDetails();
  }

  calculateCertificates(arr): void {
    if (arr.length > 0) {
      this.cancelCertBtn = true;
      arr.forEach((certificate, index) => {
        this.orderService
          .processCertificate(certificate)
          .pipe(takeUntil(this.destroy))
          .subscribe(
            (cert) => {
              this.certificateMatch(cert);
              if (this.total < this.certificateSum) {
                this.certSize = true;
              }
              this.calculateTotal();
              this.cancelCertBtn = false;
            },
            (error) => {
              this.cancelCertBtn = false;
              if (error.status === 404) {
                arr.splice(index, 1);
                this.certificateError = true;
              }
            }
          );
      });
    } else {
      this.calculateTotal();
    }
    this.certificateSum = 0;
  }

  addNewCertificate(): void {
    this.formArrayCertificates.push(this.fb.control('', [Validators.minLength(8), Validators.pattern(this.certificatePattern)]));
  }

  certificateReset(resetMessage: boolean): void {
    if (resetMessage) {
      this.certDate = '';
      this.certStatus = '';
      this.addCert = true;
    }
    const fullBonus = this.pointsUsed + this.points;
    if (this.finalSum === 0 && this.pointsUsed + this.points >= this.certificateSum && this.pointsUsed !== 0) {
      this.finalSum = this.showTotal;
      this.finalSum -= fullBonus;
      this.pointsUsed = fullBonus;
      this.points = 0;
    }
    this.clickOnYes = true;
    this.bonusesRemaining = false;
    this.showCertificateUsed = null;
    this.addCert = false;
    this.displayCert = false;
    this.certificates = [];
    this.certSize = false;
    this.certificateLeft = 0;
    this.certificateSum = 0;
    this.fullCertificate = 0;
    this.formArrayCertificates.patchValue(['']);
    this.calculateCertificates(this.certificates);
    this.sendDataToParents();
  }

  deleteCertificate(index: number): void {
    this.certificates.splice(index, 1);
    this.clearAdditionalCertificate(index);
    this.certificateError = false;
  }

  private clearAdditionalCertificate(index: number) {
    this.certificateReset(true);
    if (this.formArrayCertificates.length > 1) {
      this.formArrayCertificates.removeAt(index);
    } else {
      this.formArrayCertificates.patchValue(['']);
      this.formArrayCertificates.markAsUntouched();
    }
    this.certStatuses.splice(index, 1);
    this.calculateCertificates(this.certificates);
  }

  showCancelButton(i: number) {
    return (
      (this.certStatuses[i] && this.formArrayCertificates.controls[i].value) ||
      (this.formArrayCertificates.controls.length > 1 && !this.formArrayCertificates.controls[i].value.length)
    );
  }

  certificateSubmit(index: number): void {
    if (!this.certificates.includes(this.formArrayCertificates.value[index])) {
      this.certificates.push(this.formArrayCertificates.value[index]);
      this.certStatuses.push(true);
      this.calculateCertificates(this.certificates);
    }
  }

  showActivateButton(i: number) {
    return (
      (!this.certStatuses[i] && this.formArrayCertificates.controls[i].value && !this.disableAddCertificate()) ||
      (this.formArrayCertificates.controls.length === 1 && !this.formArrayCertificates.controls[i].value.length)
    );
  }

  public selectPointsRadioBtn(event: KeyboardEvent, radioButtonValue: string) {
    if (['Enter', 'Space', 'NumpadEnter'].includes(event.code)) {
      this.orderDetailsForm.controls.bonus.setValue(radioButtonValue);
    }
  }

  private calculatePointsWithoutCertificate() {
    this.finalSum = this.showTotal;
    const totalSumIsBiggerThanPoints = this.points > this.showTotal;
    if (totalSumIsBiggerThanPoints) {
      this.pointsUsed += this.finalSum;
      this.points = this.points - this.finalSum;
      this.finalSum = 0;
      this.sendDataToParents();
      return;
    }
    this.pointsUsed = this.points;
    this.points = 0;
    this.finalSum = this.showTotal - this.pointsUsed;
    this.sendDataToParents();
  }

  private calculatePointsWithCertificate() {
    const totalSumIsBiggerThanPoints = this.points > this.finalSum - this.certificateSum;
    this.finalSum = this.showTotal;
    if (totalSumIsBiggerThanPoints) {
      this.pointsUsed = this.finalSum - this.certificateSum;
      this.points = this.points - this.pointsUsed;
      this.finalSum = 0;
    } else {
      this.pointsUsed = this.points;
      this.finalSum = this.finalSum - this.pointsUsed - this.certificateSum;
      this.points = 0;
    }
    if (this.finalSum < 0) {
      this.finalSum = 0;
    }
    this.sendDataToParents();
  }

  calculatePoints(): void {
    this.fullCertificate = this.certificateSum;
    if (this.certificateSum >= this.showTotal) {
      this.orderDetailsForm.controls.bonus.setValue('no');
    }
    if (this.clickOnYes && this.certificateSum < this.showTotal) {
      this.orderDetailsForm.controls.bonus.setValue('yes');
      this.clickOnNo = true;
      if (this.certificateSum <= 0) {
        this.calculatePointsWithoutCertificate();
      } else {
        this.calculatePointsWithCertificate();
      }
      if (this.finalSum < 0) {
        this.finalSum = 0;
      }
      this.sendDataToParents();
      this.clickOnYes = false;
    }
  }

  resetPoints(): void {
    if (this.clickOnNo) {
      if (this.certificateSum < this.showTotal) {
        this.orderDetailsForm.get('bonus').setValue('no');
        this.clickOnYes = true;
        this.finalSum = this.showTotal;
        this.points = this.pointsUsed + this.points;
        this.pointsUsed = 0;
        if (this.certificateSum > 0) {
          this.finalSum -= this.certificateSum;
        }
        this.sendDataToParents();
        this.points = this.showTotal + this.points;
      }
      this.clickOnNo = false;
    }
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.unsubscribe();
  }
}
