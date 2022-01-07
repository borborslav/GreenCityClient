import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { IGeneralOrderInfo } from '../../models/ubs-admin.interface';
import { OrderService } from '../../services/order.service';
import { MatDialog } from '@angular/material/dialog';
import { AddOrderCancellationReasonComponent } from '../add-order-cancellation-reason/add-order-cancellation-reason.component';

@Component({
  selector: 'app-ubs-admin-order-status',
  templateUrl: './ubs-admin-order-status.component.html',
  styleUrls: ['./ubs-admin-order-status.component.scss']
})
export class UbsAdminOrderStatusComponent implements OnChanges, OnInit, OnDestroy {
  @Input() currentOrderPrice: number;
  @Input() generalOrderInfo: FormGroup;
  @Input() totalPaid: number;
  @Input() generalInfo: IGeneralOrderInfo;
  @Output() changedOrderStatus = new EventEmitter<string>();

  constructor(public orderService: OrderService, private dialog: MatDialog) {}
  private destroy$: Subject<boolean> = new Subject<boolean>();

  public availableOrderStatuses;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentOrderPrice || changes.totalPaid) {
      this.setOrderPaymentStatus();
    }
  }

  ngOnInit() {
    this.availableOrderStatuses = this.orderService.getAvailableOrderStatuses(
      this.generalInfo.orderStatus,
      this.generalInfo.orderStatusesDtos
    );
  }

  onChangedOrderStatus(statusName: string) {
    this.changedOrderStatus.emit(statusName);
    if (statusName === 'CANCELED') {
      this.openPopup();
    }
  }

  openPopup() {
    this.dialog
      .open(AddOrderCancellationReasonComponent, {
        hasBackdrop: true
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (res.action === 'cancel') {
          this.onChangedOrderStatus(this.generalInfo.orderStatus);
          this.generalOrderInfo.get('orderStatus').setValue(this.generalInfo.orderStatus);
          return;
        }
        this.generalOrderInfo.get('cancellationReason').setValue(res.reason);
        this.generalOrderInfo.get('cancellationReason').markAsDirty();
        if (res.reason === 'OTHER') {
          this.generalOrderInfo.get('cancellationComment').setValue(res.comment);
          this.generalOrderInfo.get('cancellationComment').markAsDirty();
        }
      });
  }

  public setOrderPaymentStatus() {
    let orderState: string;
    this.generalInfo.orderStatusesDtos.find((status) => {
      if (status.key === this.generalInfo.orderStatus) {
        orderState = status.ableActualChange ? 'actual' : 'confirmed';
      }
    });

    if (orderState === 'confirmed') {
      const confirmedPaidCondition1 = this.currentOrderPrice > 0 && this.totalPaid > 0 && this.currentOrderPrice <= this.totalPaid;
      const confirmedPaidCondition2 = this.currentOrderPrice === 0 && this.totalPaid >= 0 && this.currentOrderPrice <= this.totalPaid;
      const confirmedPaidCondition = confirmedPaidCondition1 || confirmedPaidCondition2;

      const confirmedUnpaidCondition = this.currentOrderPrice > 0 && this.totalPaid === 0;
      const confirmedHalfPaidCondition = this.currentOrderPrice > 0 && this.totalPaid > 0 && this.currentOrderPrice > this.totalPaid;

      if (confirmedPaidCondition) {
        this.generalInfo.orderPaymentStatus = 'PAID';
      }

      if (confirmedUnpaidCondition) {
        this.generalInfo.orderPaymentStatus = 'UNPAID';
      }

      if (confirmedHalfPaidCondition) {
        this.generalInfo.orderPaymentStatus = 'HALF_PAID';
      }
    } else if (orderState === 'actual') {
      const actualPaidCondition1 = this.currentOrderPrice > 0 && this.totalPaid > 0 && this.currentOrderPrice <= this.totalPaid;
      const actualPaidCondition2 = this.currentOrderPrice === 0 && this.totalPaid >= 0 && this.currentOrderPrice <= this.totalPaid;
      const actualPaidCondition = actualPaidCondition1 || actualPaidCondition2;

      const actualUnpaidCondition = this.currentOrderPrice === 0 && this.totalPaid === 0;
      const actualHalfPaidCondition = this.currentOrderPrice > 0 && this.totalPaid >= 0 && this.currentOrderPrice > this.totalPaid;

      if (actualPaidCondition) {
        this.generalInfo.orderPaymentStatus = 'PAID';
      }

      if (actualUnpaidCondition) {
        this.generalInfo.orderPaymentStatus = 'UNPAID';
      }

      if (actualHalfPaidCondition) {
        this.generalInfo.orderPaymentStatus = 'HALF_PAID';
      }

      // TODO: ADD PAYMENT_REFUNDED CASE THEN IT WILL BE IMPLEMENTED
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
