import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-add-order-cancellation-reason',
  templateUrl: './add-order-cancellation-reason.component.html',
  styleUrls: ['./add-order-cancellation-reason.component.scss']
})
export class AddOrderCancellationReasonComponent implements OnInit {
  closeButton = './assets/img/profile/icons/cancel.svg';
  date = new Date();
  public cancellationReason: string;
  public cancellationComment: string;
  reasonList: any[] = [
    {
      value: 'DELIVERED_HIMSELF',
      translation: 'order-cancel.reason.delivered-himself'
    },
    {
      value: 'MOVING_OUT',
      translation: 'order-cancel.reason.moving-out'
    },
    {
      value: 'OUT_OF_CITY',
      translation: 'order-cancel.reason.out-of-city'
    },
    {
      value: 'DISLIKED_SERVICE',
      translation: 'order-cancel.reason.disliked-service'
    },
    {
      value: 'OTHER',
      translation: 'order-cancel.reason.other'
    }
  ];
  public adminName;
  private destroySub: Subject<boolean> = new Subject<boolean>();

  constructor(private localeStorageService: LocalStorageService, private dialogRef: MatDialogRef<AddOrderCancellationReasonComponent>) {}

  ngOnInit(): void {
    this.localeStorageService.firstNameBehaviourSubject.pipe(takeUntil(this.destroySub)).subscribe((firstName) => {
      this.adminName = firstName;
    });
  }

  close() {
    const res = {
      action: 'cancel'
    };
    this.dialogRef.close(res);
  }

  save() {
    const res = {
      action: 'add',
      reason: this.cancellationReason,
      comment: this.cancellationComment
    };
    this.dialogRef.close(res);
  }
}
