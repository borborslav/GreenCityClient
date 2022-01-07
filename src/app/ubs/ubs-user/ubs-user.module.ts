import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { UbsUserOrdersListComponent } from './ubs-user-orders-list/ubs-user-orders-list.component';
import { UbsUserOrderDetailsComponent } from './ubs-user-order-details/ubs-user-order-details.component';
import { UbsUserOrdersComponent } from './ubs-user-orders/ubs-user-orders.component';
import { UbsUserRoutingModule } from './ubs-user-routing.module';
import { UbsUserComponent } from './ubs-user.component';
import { UbsUserSidebarComponent } from './ubs-user-sidebar/ubs-user-sidebar.component';
import { IMaskModule } from 'angular-imask';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UbsUserMessagesComponent } from './ubs-user-messages/ubs-user-messages.component';
import { NotificationBodyComponent } from './ubs-user-messages/notification-body/notification-body.component';
import { UbsUserBonusesComponent } from './ubs-user-bonuses/ubs-user-bonuses.component';
import { MaterialModule } from '../../material.module';
import { UbsUserProfilePageComponent } from './ubs-user-profile-page/ubs-user-profile-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UbsProfileChangePasswordPopUpComponent } from './ubs-user-profile-page/ubs-profile-change-password-pop-up/ubs-profile-change-password-pop-up.component';
import { UbsProfileDeletePopUpComponent } from './ubs-user-profile-page/ubs-profile-delete-pop-up/ubs-profile-delete-pop-up.component';
import { UbsUserOrderPaymentPopUpComponent } from './ubs-user-orders-list/ubs-user-order-payment-pop-up/ubs-user-order-payment-pop-up.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { UbsUserOrderCancelPopUpComponent } from './ubs-user-orders-list/ubs-user-order-cancel-pop-up/ubs-user-order-cancel-pop-up.component';

@NgModule({
  declarations: [
    UbsUserSidebarComponent,
    UbsUserBonusesComponent,
    UbsUserComponent,
    UbsUserOrderDetailsComponent,
    UbsUserOrdersComponent,
    UbsUserOrdersListComponent,
    UbsUserMessagesComponent,
    NotificationBodyComponent,
    UbsUserProfilePageComponent,
    UbsProfileChangePasswordPopUpComponent,
    UbsProfileDeletePopUpComponent,
    UbsUserOrderPaymentPopUpComponent,
    UbsUserOrderCancelPopUpComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    UbsUserRoutingModule,
    SharedModule,
    IMaskModule,
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoaderUbsUser,
        deps: [HttpClient]
      },
      isolate: true
    }),
    MatExpansionModule,
    NgxPaginationModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatRadioModule
  ],
  providers: [
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: { hasBackdrop: true }
    }
  ],
  entryComponents: [
    UbsProfileChangePasswordPopUpComponent,
    UbsProfileDeletePopUpComponent,
    UbsUserOrderPaymentPopUpComponent,
    UbsUserOrderCancelPopUpComponent
  ]
})
export class UbsUserModule {}

export function createTranslateLoaderUbsUser(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/ubs-admin/', '.json');
}
