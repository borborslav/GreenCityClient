import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TableHeightService {
  setTableHeightToContainerHeight(table, tableContainer) {
    if (table) {
      let isHeightSet: boolean;
      const tableHeight = table.getBoundingClientRect().height;
      const tableContainerHeight = this.setTableContainerHeight(tableContainer).getBoundingClientRect().height;
      isHeightSet = tableHeight >= tableContainerHeight;
      return isHeightSet;
    }
  }

  private setTableContainerHeight(tableContainer) {
    tableContainer.style.height = document.documentElement.clientHeight - tableContainer.getBoundingClientRect().y + 'px';
    return tableContainer;
  }
}
