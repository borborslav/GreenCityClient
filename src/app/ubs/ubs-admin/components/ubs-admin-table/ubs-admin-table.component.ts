import { TableHeightService } from '../../services/table-height.service';
import { UbsAdminTableExcelPopupComponent } from './ubs-admin-table-excel-popup/ubs-admin-table-excel-popup.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { nonSortableColumns } from '../../models/non-sortable-columns.model';
import { AdminTableService } from '../../services/admin-table.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { debounceTime, take, takeUntil } from 'rxjs/operators';
import { Subject, timer } from 'rxjs';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewChecked, ChangeDetectorRef, ElementRef, Renderer2 } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { IEditCell, IAlertInfo } from '../../models/edit-cell.model';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-ubs-admin-table',
  templateUrl: './ubs-admin-table.component.html',
  styleUrls: ['./ubs-admin-table.component.scss']
})
export class UbsAdminTableComponent implements OnInit, AfterViewChecked, OnDestroy {
  currentLang: string;
  nonSortableColumns = nonSortableColumns;
  sortingColumn: string;
  sortType: string;
  columns: any[] = [];
  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel<any>(true, []);
  previousIndex: number;
  isLoading = true;
  editCellProgressBar: boolean;
  isUpdate = false;
  destroy: Subject<boolean> = new Subject<boolean>();
  arrowDirection: string;
  isTableHeightSet = false;
  tableData: any[];
  totalElements = 0;
  allElements: number;
  totalPages: number;
  currentPage = 0;
  pageSize = 25;
  idsToChange: number[] = [];
  allChecked = false;
  tableViewHeaders = [];
  public blockedInfo: IAlertInfo[] = [];
  isAll: boolean;
  count: number;
  display = 'none';
  filterValue = '';
  isPopupOpen: boolean;
  stickyColumn = [];
  model: string;
  modelChanged: Subject<string> = new Subject<string>();
  currentResizeIndex: number;
  pressed = false;
  startX: number;
  startWidth: number;
  isResizingRight: boolean;
  resizableMousemove: () => void;
  resizableMouseup: () => void;
  @ViewChild(MatTable, { read: ElementRef }) private matTableRef: ElementRef;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private adminTableService: AdminTableService,
    private localStorageService: LocalStorageService,
    private tableHeightService: TableHeightService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroy)).subscribe((lang) => {
      this.currentLang = lang;
    });
    this.modelChanged.pipe(debounceTime(500)).subscribe((model) => {
      this.currentPage = 0;
      this.getTable(model, 'id', 'DESC');
    });
    this.orderService.getColumnToDisplay().subscribe((items: any) => {
      this.displayedColumns = items.titles.split(',')[0] === '' ? [] : items.titles.split(',');
      this.isAll = false;
    });
    this.getColumns();
  }

  ngAfterViewChecked() {
    if (!this.isTableHeightSet) {
      const table = document.getElementById('table');
      const tableContainer = document.getElementById('table-container');
      this.isTableHeightSet = this.tableHeightService.setTableHeightToContainerHeight(table, tableContainer);
      if (!this.isTableHeightSet) {
        this.onScroll();
      }
    }
    this.cdr.detectChanges();
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
    this.modelChanged.next(filterValue);
  }

  dropListDropped(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
    this.orderService.setColumnToDisplay(encodeURIComponent(this.displayedColumns.join(','))).subscribe();
    this.stickyColumn = [];
    for (let i = 0; i < 4; i++) {
      this.stickyColumn.push(this.displayedColumns[i]);
    }
    this.columns.forEach((item) => {
      item.sticky = this.stickyColumn.includes(item.title.key);
    });
    this.sortColumnsToDisplay();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  public showBlockedMessage(info): void {
    this.blockedInfo = info;

    const uniqUsers: string[] = [];
    const convertInfo = [];

    this.blockedInfo.forEach((item: IAlertInfo) => {
      if (!uniqUsers.includes(item.userName)) {
        uniqUsers.push(item.userName);
      }

      const index = this.dataSource.filteredData.findIndex((row) => row.id === item.orderId);
      this.selection.deselect(this.dataSource.filteredData[index]);

      if (this.idsToChange.includes(item.orderId)) {
        this.idsToChange = this.idsToChange.filter((id) => id !== item.orderId);
      }
    });

    uniqUsers.forEach((userName) => {
      let ids: number[] = [];
      this.blockedInfo.forEach((userInfo: IAlertInfo) => {
        if (userName === userInfo.userName) {
          ids.push(userInfo.orderId);
        }
      });
      convertInfo.push({ ordersId: ids, userName });
      ids = [];
    });
    this.blockedInfo = convertInfo;

    timer(7000)
      .pipe(take(1))
      .subscribe(() => {
        this.blockedInfo = [];
      });
  }

  public changeColumns(checked: boolean, key: string, positionIndex): void {
    this.displayedColumns = checked
      ? [...this.displayedColumns.slice(0, positionIndex), key, ...this.displayedColumns.slice(positionIndex)]
      : this.displayedColumns.filter((item) => item !== key);
    this.isAll = this.count === this.displayedColumns.length;
  }

  public togglePopUp() {
    this.display = this.display === 'none' ? 'block' : 'none';
    this.isPopupOpen = !this.isPopupOpen;
    if (this.isPopupOpen === false) {
      this.orderService.setColumnToDisplay(encodeURIComponent(this.displayedColumns.join(','))).subscribe();
    }
  }

  public showAllColumns(isCheckAll: boolean): void {
    isCheckAll ? this.setUnDisplayedColumns() : this.setDisplayedColumns();
  }

  private getColumns() {
    this.adminTableService
      .getColumns()
      .pipe(takeUntil(this.destroy))
      .subscribe((columns: any) => {
        this.tableViewHeaders = columns.columnBelongingList;
        this.columns = columns.columnDTOList;
        this.columns.forEach((column) => {
          column.width = 200;
        });
        if (this.displayedColumns.length === 0) {
          this.setDisplayedColumns();
        }
        const { pageNumber, pageSize, sortDirection, sortBy } = columns.page;
        this.pageSize = pageSize;
        this.currentPage = pageNumber;
        this.getTable(this.filterValue, sortBy, sortDirection);
        this.sortColumnsToDisplay();
      });
  }

  private getTable(filterValue, columnName = this.sortingColumn || 'id', sortingType = this.sortType || 'DESC') {
    this.isLoading = true;
    this.adminTableService
      .getTable(columnName, this.currentPage, filterValue, this.pageSize, sortingType)
      .pipe(takeUntil(this.destroy))
      .subscribe((item) => {
        this.tableData = item[`content`];
        this.totalPages = item[`totalPages`];
        this.totalElements = item[`totalElements`];
        this.allElements = !this.allElements ? this.totalElements : this.allElements;
        this.dataSource = new MatTableDataSource(this.tableData);
        this.isLoading = false;
        this.isTableHeightSet = false;
        this.changeView();
      });
  }

  changeView() {
    this.tableData.forEach((el) => {
      el.amountDue = parseFloat(el.amountDue).toFixed(2);
      el.totalOrderSum = parseFloat(el.totalOrderSum).toFixed(2);
      const arr = el.orderCertificatePoints.split(', ');
      if (arr && arr.length > 0) {
        el.orderCertificatePoints = arr.reduce((res, elem) => {
          res = parseInt(res, 10);
          res += parseInt(elem, 10);
          return res ? res + '' : '';
        });
      }
    });
  }

  updateTableData() {
    this.isUpdate = true;
    this.adminTableService
      .getTable(this.sortingColumn || 'id', this.currentPage, this.filterValue, this.pageSize, this.sortType || 'DESC')
      .pipe(takeUntil(this.destroy))
      .subscribe((item) => {
        const data = item[`content`];
        this.totalPages = item[`totalPages`];
        this.tableData = [...this.tableData, ...data];
        this.dataSource.data = this.tableData;
        this.isUpdate = false;
        this.changeView();
      });
  }

  getSortingData(columnName, sortingType) {
    this.sortingColumn = columnName;
    this.sortType = sortingType;
    this.arrowDirection = this.arrowDirection === columnName ? null : columnName;
    this.currentPage = 0;
    this.getTable(this.filterValue, columnName, sortingType);
  }

  openExportExcel(): void {
    const dialogConfig = new MatDialogConfig();
    const dialogRef = this.dialog.open(UbsAdminTableExcelPopupComponent, dialogConfig);
    dialogRef.componentInstance.totalElements = this.totalElements;
    dialogRef.componentInstance.allElements = this.allElements;
    dialogRef.componentInstance.sortingColumn = this.sortingColumn;
    dialogRef.componentInstance.sortType = this.sortType;
    dialogRef.componentInstance.search = this.filterValue;
    dialogRef.componentInstance.name = 'Orders-Table.xlsx';
  }

  onScroll() {
    if (!this.isUpdate && this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateTableData();
    }
  }

  selectRowsToChange(event, id: number) {
    if (event.checked) {
      this.idsToChange.push(id);
    } else {
      this.idsToChange = this.idsToChange.filter((item) => item !== id);
    }
  }

  selectAll(checked: boolean) {
    if (checked) {
      this.allChecked = checked;
      this.idsToChange = [];
    } else {
      this.allChecked = checked;
    }
  }

  public editCell(e: IEditCell): void {
    if (this.allChecked) {
      this.editAll(e);
    } else if (this.idsToChange.length === 0) {
      this.editSingle(e);
    } else {
      this.editGroup(e);
    }
  }

  public cancelEditCell(ids: number[]): void {
    this.adminTableService.cancelEdit(ids).subscribe();
    this.idsToChange = [];
    this.allChecked = false;
  }

  public closeAlertMess(): void {
    this.blockedInfo = [];
  }

  private setDisplayedColumns(): void {
    this.columns.forEach((column, index) => {
      this.displayedColumns[index] = column.title.key;
    });
    this.isAll = true;
    this.count = this.displayedColumns.length;
  }

  private setUnDisplayedColumns(): void {
    this.displayedColumns = [];
    this.isAll = false;
  }

  private editSingle(e: IEditCell): void {
    this.editCellProgressBar = true;
    const id = this.tableData.findIndex((item) => item.id === e.id);
    const newRow = { ...this.tableData[id], [e.nameOfColumn]: e.newValue };
    const newTableData = [...this.tableData.slice(0, id), newRow, ...this.tableData.slice(id + 1)];
    this.tableData = newTableData;
    this.dataSource = new MatTableDataSource(newTableData);
    this.postData([e.id], e.nameOfColumn, e.newValue);
  }

  private editGroup(e: IEditCell): void {
    this.editCellProgressBar = true;
    const ids = [];
    let newTableDataCombine = this.tableData;

    for (const idIter of this.idsToChange) {
      const check = this.tableData.findIndex((item) => item.id === idIter);
      if (check > -1) {
        ids.push(check);
      }
    }

    for (const idGroup of ids) {
      const newRowGroup = { ...this.tableData[idGroup], [e.nameOfColumn]: e.newValue };
      newTableDataCombine = [...newTableDataCombine.slice(0, idGroup), newRowGroup, ...newTableDataCombine.slice(idGroup + 1)];
    }

    this.tableData = newTableDataCombine;
    this.dataSource = new MatTableDataSource(newTableDataCombine);
    this.postData(this.idsToChange, e.nameOfColumn, e.newValue);
  }

  private editAll(e: IEditCell): void {
    this.editCellProgressBar = true;
    const newTableData = this.tableData.map((item) => {
      return {
        ...item,
        [e.nameOfColumn]: e.newValue
      };
    });
    this.tableData = newTableData;
    this.dataSource = new MatTableDataSource(newTableData);
    this.allChecked = false;
    this.idsToChange = [];
    this.editCellProgressBar = false;
    // empty array define that we change all in column
    this.postData([], e.nameOfColumn, e.newValue);
  }

  private postData(id, nameOfColumn, newValue): void {
    this.adminTableService.postData(id, nameOfColumn, newValue).subscribe(() => {
      this.editCellProgressBar = false;
      this.idsToChange = [];
      this.allChecked = false;
    });
  }

  openOrder(id: number): void {
    this.router.navigate(['ubs-admin', 'order', `${id}`]);
  }

  showTooltip(title, tooltip) {
    const lengthStrUa = title.ua.split('').length;
    const lengthStrEn = title.en.split('').length;
    if ((this.currentLang === 'ua' && lengthStrUa > 17) || (this.currentLang === 'en' && lengthStrEn > 18)) {
      tooltip.toggle();
    }
  }

  sortColumnsToDisplay() {
    const arr = [];
    this.columns.forEach((el) => {
      arr[this.displayedColumns.findIndex((res) => res === el.title.key)] = el;
    });
    this.columns = arr;
  }

  public onResizeColumn(event: any, index: number) {
    this.checkResizing(event, index);
    this.currentResizeIndex = index;
    this.pressed = true;
    this.startX = event.pageX;
    this.startWidth = event.target.clientWidth;
    this.mouseMove(index);
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
    const cell = headerRow.children[0].children[index];
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

      if (newWidth > 100 && index > 3) {
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

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.unsubscribe();
  }
}
