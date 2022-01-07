import { AdminTableService } from './services/admin-table.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { UbsAdminTableComponent } from './components/ubs-admin-table/ubs-admin-table.component';
import { UbsAdminSidebarComponent } from './components/ubs-admin-sidebar/ubs-admin-sidebar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MaterialModule } from '../../material.module';
import { IMaskModule } from 'angular-imask';
import { SharedModule } from '../../shared/shared.module';
import { UbsAdminComponent } from './ubs-admin.component';
import { UbsAdminEmployeeComponent } from './components/ubs-admin-employee/ubs-admin-employee.component';
import { UbsAdminEmployeeCardComponent } from './components/ubs-admin-employee/ubs-admin-employee-card/ubs-admin-employee-card.component';
import { PaginationComponent } from './components/shared/components/pagination/pagination.component';
import { EmployeeFormComponent } from './components/ubs-admin-employee/employee-form/employee-form.component';
import { UBSAdminRoutingModule } from './ubs-admin-routing.module';
import { UbsAdminResponsiblePersonsComponent } from './components/ubs-admin-responsible-persons/ubs-admin-responsible-persons.component';
import { UbsAdminExportDetailsComponent } from './components/ubs-admin-export-details/ubs-admin-export-details.component';
import { UbsAdminOrderPaymentComponent } from './components/ubs-admin-order-payment/ubs-admin-order-payment.component';
import { UbsAdminOrderClientInfoComponent } from './components/ubs-admin-order-client-info/ubs-admin-order-client-info.component';
import { UbsAdminOrderDetailsFormComponent } from './components/ubs-admin-order-details-form/ubs-admin-order-details-form.component';
import { UbsAdminOrderStatusComponent } from './components/ubs-admin-order-status/ubs-admin-order-status.component';
import { UbsAdminOrderComponent } from './components/ubs-admin-order/ubs-admin-order.component';
import { UbsAdminAddressDetailsComponent } from './components/ubs-admin-address-details/ubs-admin-address-details.component';
import { InterceptorService } from '../../shared/interceptors/interceptor.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AddViolationsComponent } from './components/add-violations/add-violations.component';
import { UbsAdminCancelModalComponent } from './components/ubs-admin-cancel-modal/ubs-admin-cancel-modal.component';
import { UbsAdminGoBackModalComponent } from './components/ubs-admin-go-back-modal/ubs-admin-go-back-modal.component';
import { MatTabsModule } from '@angular/material/tabs';
import { UbsAdminTableExcelPopupComponent } from './components/ubs-admin-table/ubs-admin-table-excel-popup/ubs-admin-table-excel-popup.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TableCellReadonlyComponent } from './components/ubs-admin-table/table-cell-readonly/table-cell-readonly.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableCellSelectComponent } from './components/ubs-admin-table/table-cell-select/table-cell-select.component';
import { TableCellDateComponent } from './components/ubs-admin-table/table-cell-date/table-cell-date.component';
import { TableCellTimeComponent } from './components/ubs-admin-table/table-cell-time/table-cell-time.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { UbsAdminCertificateComponent } from './components/ubs-admin-certificate/ubs-admin-certificate.component';
import { AdminCertificateService } from './services/admin-certificate.service';
import { UbsAdminCertificateAddCertificatePopUpComponent } from './components/ubs-admin-certificate/ubs-admin-certificate-add-certificate-pop-up/ubs-admin-certificate-add-certificate-pop-up.component';
import { UbsAdminCustomersComponent } from './components/ubs-admin-customers/ubs-admin-customers.component';
import { MatTableModule } from '@angular/material/table';
import { UbsAdminTariffsPricingPageComponent } from './components/ubs-admin-tariffs/ubs-admin-tariffs-pricing-page/ubs-admin-tariffs-pricing-page.component';
import { UbsAdminTariffsAddTariffServicePopUpComponent } from './components/ubs-admin-tariffs/ubs-admin-tariffs-pricing-page/ubs-admin-tariffs-add-tariff-service-pop-up/ubs-admin-tariffs-add-tariff-service-pop-up.component';
import { UbsAdminTariffsLocationDashboardComponent } from './components/ubs-admin-tariffs/ubs-admin-tariffs-location-dashboard.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UbsAdminTariffsDeletePopUpComponent } from './components/ubs-admin-tariffs/ubs-admin-tariffs-pricing-page/ubs-admin-tariffs-delete-pop-up/ubs-admin-tariffs-delete-pop-up.component';
import { UbsAdminTariffsAddServicePopUpComponent } from './components/ubs-admin-tariffs/ubs-admin-tariffs-pricing-page/ubs-admin-tariffs-add-service-pop-up/ubs-admin-tariffs-add-service-pop-up.component';
import { UbsAdminEmployeeTableComponent } from './components/ubs-admin-employee/ubs-admin-employee-table/ubs-admin-employee-table.component';
import { UbsAdminCustomerDetailsComponent } from './components/ubs-admin-customers/ubs-admin-customer-details/ubs-admin-customer-details.component';
import { UbsAdminOrderHistoryComponent } from './components/ubs-admin-order-history/ubs-admin-order-history.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { UbsAdminTariffsAddLocationPopUpComponent } from './components/ubs-admin-tariffs/ubs-admin-tariffs-add-location-pop-up/ubs-admin-tariffs-add-location-pop-up.component';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { AgmCoreModule } from '@agm/core';
import { environment } from '@environment/environment';
import { UbsAdminTariffsAddCourierPopUpComponent } from './components/ubs-admin-tariffs/ubs-admin-tariffs-add-courier-pop-up/ubs-admin-tariffs-add-courier-pop-up.component';
import { MatDialogModule } from '@angular/material/dialog';
import { UbsAdminCustomerOrdersComponent } from './components/ubs-admin-customers/ubs-admin-customer-orders/ubs-admin-customer-orders.component';
import { AddOrderCancellationReasonComponent } from './components/add-order-cancellation-reason/add-order-cancellation-reason.component';
import { DialogPopUpComponent } from './components/shared/components/dialog-pop-up/dialog-pop-up.component';
import { ResizeColumnDirective } from './derictives/resize-table-columns.directive';
import { AddPaymentComponent } from './components/add-payment/add-payment.component';
import { UbsAdminCustomerViolationsComponent } from './components/ubs-admin-customers/ubs-admin-customer-violations/ubs-admin-customer-violations/ubs-admin-customer-violations.component';
import { ShowImgsPopUpComponent } from './components/shared/components/show-imgs-pop-up/show-imgs-pop-up.component';

@NgModule({
  declarations: [
    PaginationComponent,
    UbsAdminTableComponent,
    UbsAdminTableExcelPopupComponent,
    UbsAdminSidebarComponent,
    UbsAdminComponent,
    UbsAdminEmployeeComponent,
    UbsAdminEmployeeCardComponent,
    EmployeeFormComponent,
    UbsAdminOrderComponent,
    UbsAdminAddressDetailsComponent,
    UbsAdminOrderStatusComponent,
    UbsAdminResponsiblePersonsComponent,
    UbsAdminExportDetailsComponent,
    UbsAdminOrderPaymentComponent,
    UbsAdminOrderClientInfoComponent,
    UbsAdminOrderDetailsFormComponent,
    AddViolationsComponent,
    UbsAdminCancelModalComponent,
    UbsAdminGoBackModalComponent,
    TableCellReadonlyComponent,
    TableCellSelectComponent,
    TableCellDateComponent,
    TableCellTimeComponent,
    UbsAdminCertificateComponent,
    UbsAdminTariffsDeletePopUpComponent,
    UbsAdminTariffsAddServicePopUpComponent,
    UbsAdminCertificateAddCertificatePopUpComponent,
    UbsAdminCustomersComponent,
    UbsAdminTariffsPricingPageComponent,
    UbsAdminTariffsAddTariffServicePopUpComponent,
    UbsAdminTariffsLocationDashboardComponent,
    UbsAdminEmployeeTableComponent,
    UbsAdminCustomerDetailsComponent,
    UbsAdminTariffsAddLocationPopUpComponent,
    UbsAdminTariffsAddCourierPopUpComponent,
    UbsAdminCustomerOrdersComponent,
    UbsAdminOrderHistoryComponent,
    AddOrderCancellationReasonComponent,
    DialogPopUpComponent,
    ResizeColumnDirective,
    AddPaymentComponent,
    UbsAdminCustomerViolationsComponent,
    ShowImgsPopUpComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    RouterModule,
    IMaskModule,
    HttpClientModule,
    UBSAdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    InfiniteScrollModule,
    MatTabsModule,
    MatTooltipModule,
    DragDropModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatNativeDateModule,
    MatTableModule,
    MatDialogModule,
    GooglePlaceModule,
    AgmCoreModule.forRoot({
      apiKey: environment.agmCoreModuleApiKey,
      libraries: ['places']
    }),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoaderUbs,
        deps: [HttpClient]
      },
      isolate: true
    }),
    TooltipModule
  ],
  providers: [
    AdminCertificateService,
    AdminTableService,
    TranslateService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    }
  ],
  entryComponents: [
    UbsAdminTableComponent,
    AddViolationsComponent,
    EmployeeFormComponent,
    UbsAdminCancelModalComponent,
    UbsAdminGoBackModalComponent
  ]
})
export class UbsAdminModule {}

export function createTranslateLoaderUbs(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/ubs-admin/', '.json');
}
