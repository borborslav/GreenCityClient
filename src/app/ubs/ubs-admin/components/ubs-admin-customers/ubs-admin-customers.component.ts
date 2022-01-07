import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ICustomersTable } from '../../models/customers-table.model';
import { nonSortableColumns } from '../../models/non-sortable-columns.model';
import { AdminCustomersService } from '../../services/admin-customers.service';
import { TableHeightService } from '../../services/table-height.service';
import { UbsAdminTableExcelPopupComponent } from '../ubs-admin-table/ubs-admin-table-excel-popup/ubs-admin-table-excel-popup.component';
import { columnsParams } from './columnsParams';
import { Filters } from './filters.interface';

@Component({
  selector: 'app-ubs-admin-customers',
  templateUrl: './ubs-admin-customers.component.html',
  styleUrls: ['./ubs-admin-customers.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UbsAdminCustomersComponent implements OnInit, AfterViewChecked, OnDestroy {
  public isLoading = false;
  public isUpdate = false;
  public nonSortableColumns = nonSortableColumns;
  public columns = [];
  public arrowDirection: string;
  public currentLang: string;
  public displayedColumns: string[] = [];
  public dataSource: MatTableDataSource<any>;
  public currentPage = 0;
  public totalElements = 0;
  public allElements: number;
  public display = 'none';
  public filterForm: FormGroup;
  public hasChange = false;
  public filters: Filters;
  public filterValue = '';
  public modelChanged: Subject<string> = new Subject<string>();
  public pageSize = 10;

  private tableData: any[];
  private sortType: string;
  private sortingColumn: string;
  private pressed = false;
  private currentResizeIndex: number;
  private startX: number;
  private startWidth: number;
  private isResizingRight: boolean;
  private totalPages = 1;
  private isTableHeightSet = false;
  private initialFilterValues: {};
  private queryString = '';
  private resizableMousemove: () => void;
  private resizableMouseup: () => void;
  private destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild(MatTable, { read: ElementRef }) private matTableRef: ElementRef;

  constructor(
    private renderer: Renderer2,
    private localStorageService: LocalStorageService,
    private tableHeightService: TableHeightService,
    private adminCustomerService: AdminCustomersService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroy$)).subscribe((lang) => {
      this.currentLang = lang;
    });
    this.columns = columnsParams;
    this.setDisplayedColumns();
    this.getTable();
    this.initFilterForm();
    this.onCreateGroupFormValueChange();
    this.modelChanged.pipe(debounceTime(500)).subscribe((model) => {
      this.currentPage = 0;
      this.getTable(model, this.sortingColumn, this.sortType);
    });
  }

  ngAfterViewChecked() {
    if (!this.isTableHeightSet && !this.isLoading) {
      const table = document.getElementById('table');
      const tableContainer = document.getElementById('table-container');
      this.isTableHeightSet = this.tableHeightService.setTableHeightToContainerHeight(table, tableContainer);
      if (!this.isTableHeightSet) {
        this.onScroll();
      }
    }
    if (!this.isLoading) {
      this.setTableResize(this.matTableRef.nativeElement.clientWidth);
    }
    this.cdr.detectChanges();
  }

  public getSortingData(columnName: string, sortingType: string) {
    this.sortingColumn = columnName;
    this.sortType = sortingType;
    this.arrowDirection = this.arrowDirection === columnName ? null : columnName;
    this.currentPage = 0;
    this.getTable();
  }

  public togglePopUp() {
    if (this.display === 'block') {
      this.submitFilterForm();
    }
    this.display = this.display === 'none' ? 'block' : 'none';
  }

  private initFilterForm() {
    this.filterForm = this.fb.group({
      registrationDateFrom: [''],
      registrationDateTo: [''],
      lastOrderDateFrom: [''],
      lastOrderDateTo: [''],
      ordersCountFrom: [''],
      ordersCountTo: [''],
      violationsFrom: [''],
      violationsTo: [''],
      bonusesFrom: [''],
      bonusesTo: ['']
    });
    this.filters = this.filterForm.value;
  }

  private submitFilterForm() {
    this.filters = this.filterForm.value;
    const prevQueryString = this.queryString;
    const queryParams = [];
    const filtersObj = {
      numberOfBonuses: [this.filters.bonusesFrom, this.filters.bonusesTo],
      numberOfOrders: [this.filters.ordersCountFrom, this.filters.ordersCountTo],
      numberOfViolations: [this.filters.violationsFrom, this.filters.violationsTo],
      orderDate: [
        this.filters.lastOrderDateFrom ? this.filters.lastOrderDateFrom.toLocaleDateString() : '',
        this.filters.lastOrderDateTo ? this.filters.lastOrderDateTo.toLocaleDateString() : ''
      ],
      userRegistrationDate: [
        this.filters.registrationDateFrom ? this.filters.registrationDateFrom.toLocaleDateString() : '',
        this.filters.registrationDateTo ? this.filters.registrationDateTo.toLocaleDateString() : ''
      ]
    };
    for (const filter in filtersObj) {
      if (filtersObj[filter][0] && filtersObj[filter][1]) {
        queryParams.push(`${filter}=${filtersObj[filter][0]}`, `${filter}=${filtersObj[filter][1]}`);
      } else if (filtersObj[filter][0] && !filtersObj[filter][1]) {
        queryParams.push(`${filter}=${filtersObj[filter][0]}`);
      } else if (!filtersObj[filter][0] && filtersObj[filter][1]) {
        queryParams.push(`${filter}=0`, `${filter}=${filtersObj[filter][1]}`);
      }
    }
    this.queryString = queryParams.join('&');
    if (this.queryString !== prevQueryString) {
      this.currentPage = 0;
      this.getTable();
    }
  }

  public onDeleteFilter(filterFrom: string, filterTo: string) {
    this.filterForm.get(filterFrom).setValue('');
    this.filterForm.get(filterTo).setValue('');
    this.submitFilterForm();
  }

  private onCreateGroupFormValueChange() {
    this.initialFilterValues = this.filterForm.value;
    this.filterForm.valueChanges.subscribe((value) => {
      this.hasChange = Object.keys(this.initialFilterValues).some((key) => {
        return this.filterForm.value[key] !== null && this.filterForm.value[key] !== this.initialFilterValues[key];
      });
    });
  }

  public onClearFilters() {
    this.filterForm.reset(this.initialFilterValues);
    this.submitFilterForm();
  }

  public openExportExcel(): void {
    const dialogConfig = new MatDialogConfig();
    const dialogRef = this.dialog.open(UbsAdminTableExcelPopupComponent, dialogConfig);
    dialogRef.componentInstance.totalElements = this.totalElements;
    dialogRef.componentInstance.allElements = this.allElements;
    dialogRef.componentInstance.sortingColumn = this.sortingColumn;
    dialogRef.componentInstance.sortType = this.sortType;
    dialogRef.componentInstance.search = this.filterValue;
    dialogRef.componentInstance.filters = this.queryString;
    dialogRef.componentInstance.name = 'Customers-Table.xlsx';
  }

  public onScroll(): void {
    if (!this.isUpdate && this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateTableData();
    }
  }

  public applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
    this.modelChanged.next(filterValue);
  }

  private getTable(
    filterValue = this.filterValue || '',
    columnName = this.sortingColumn || 'clientName',
    sortingType = this.sortType || 'ASC'
  ) {
    this.isLoading = true;
    this.adminCustomerService
      .getCustomers(columnName, this.currentPage, this.queryString, filterValue, this.pageSize, sortingType)
      .pipe(takeUntil(this.destroy$))
      .subscribe((item: ICustomersTable) => {
        this.tableData = item.page;
        this.dataSource = new MatTableDataSource(this.tableData);
        this.isLoading = false;
        this.totalPages = item.totalPages;
        this.totalElements = item.totalElements;
        this.allElements = !this.allElements ? this.totalElements : this.allElements;
        this.isTableHeightSet = false;
      });
  }

  private updateTableData() {
    this.isUpdate = true;
    this.sortingColumn = !this.sortingColumn ? 'clientName' : this.sortingColumn;
    this.adminCustomerService
      .getCustomers(this.sortingColumn, this.currentPage, this.queryString, this.filterValue, this.pageSize, this.sortType || 'ASC')
      .pipe(takeUntil(this.destroy$))
      .subscribe((item: ICustomersTable) => {
        this.tableData = [...this.tableData, ...item.page];
        this.dataSource = new MatTableDataSource(this.tableData);
        this.totalPages = item.totalPages;
        this.isUpdate = false;
        if (item.page.length) {
          this.totalElements = item.totalElements;
        }
      });
  }

  private setDisplayedColumns() {
    this.columns.forEach((column, index) => {
      column.index = index;
      this.displayedColumns[index] = column.title.key;
    });
  }

  //////////// resize logic
  public onResizeColumn(event: any, index: number) {
    this.checkResizing(event, index);
    this.currentResizeIndex = index;
    this.pressed = true;
    this.startX = event.pageX;
    this.startWidth = event.target.clientWidth;
    event.preventDefault();
    this.mouseMove(index);
  }

  private setTableResize(tableWidth: number) {
    let totWidth = 0;
    this.columns.forEach((column) => {
      totWidth += column.width;
    });
    const scale = (tableWidth - 5) / totWidth;
    this.columns.forEach((column) => {
      column.width *= scale;
      this.setColumnWidth(column);
    });
  }

  private checkResizing(event: any, index: any) {
    const cellData = this.getCellData(index);
    if (index === 0 || (Math.abs(event.pageX - cellData.right) < cellData.width / 2 && index !== this.columns.length - 1)) {
      this.isResizingRight = true;
    } else {
      this.isResizingRight = false;
    }
  }

  private getCellData(index: number) {
    const headerRow = this.matTableRef.nativeElement.children[0];
    const cell = headerRow.children[index];
    return cell.getBoundingClientRect();
  }

  private mouseMove(index: number) {
    this.resizableMousemove = this.renderer.listen('document', 'mousemove', (event) => {
      if (this.pressed && event.buttons) {
        const dx = this.isResizingRight ? event.pageX - this.startX : -event.pageX + this.startX;
        const width = this.startWidth + dx;
        if (this.currentResizeIndex === index && width > 100) {
          this.setColumnWidthChanges(index, width);
        }
      }
    });
    this.resizableMouseup = this.renderer.listen('document', 'mouseup', (event) => {
      if (this.pressed) {
        this.pressed = false;
        this.currentResizeIndex = -1;
        this.resizableMousemove();
        this.resizableMouseup();
      }
    });
  }

  private setColumnWidthChanges(index: number, width: number) {
    const orgWidth = this.columns[index].width;
    const dx = width - orgWidth;
    if (dx !== 0) {
      const j = this.isResizingRight ? index + 1 : index - 1;
      const newWidth = this.columns[j].width - dx;
      if (newWidth > 50) {
        this.columns[index].width = width;
        this.setColumnWidth(this.columns[index]);
        this.columns[j].width = newWidth;
        this.setColumnWidth(this.columns[j]);
      }
    }
  }

  private setColumnWidth(column: any) {
    const columnEls = Array.from(document.getElementsByClassName('mat-column-' + column.title.key));
    columnEls.forEach((el: any) => {
      el.style.width = column.width + 'px';
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.setTableResize(this.matTableRef.nativeElement.clientWidth);
  }

  public openPages(columnName, row) {
    if (columnName === 'clientName') {
      this.openCustomer(row, row[columnName]);
    } else if (columnName === 'number_of_orders') {
      this.openOrders(row);
    } else if (columnName === 'violations') {
      this.openViolations(row);
    }
  }

  private openCustomer(row, username): void {
    this.localStorageService.setCustomer(row);
    this.router.navigate(['ubs-admin', 'customers', `${username.replaceAll(' ', '')}`]);
  }

  private openOrders(user): void {
    this.router.navigate(['ubs-admin', 'customerOrders', `${user.userId}`]);
  }

  private openViolations(user): void {
    if (user.violations) {
      this.router.navigate(['ubs-admin', 'customerViolations', `${user.userId}`]);
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
