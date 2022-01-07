import { TipsSearchModel } from '@global-models/search/tipsSearch.model';
import { NewsSearchModel } from '@global-models/search/newsSearch.model';
import { SearchModel } from '@global-models/search/search.model';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { searchIcons } from '../../main/image-pathes/search-icons';
import { negate, isNil } from 'lodash';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, tap, switchMap, filter } from 'rxjs/operators';
import { SearchService } from '@global-service/search/search.service';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-search-popup',
  templateUrl: './search-popup.component.html',
  styleUrls: ['./search-popup.component.scss']
})
export class SearchPopupComponent implements OnInit, OnDestroy {
  public newsElements: NewsSearchModel[] = [];
  public tipsElements: TipsSearchModel[] = [];
  public isSearchClicked = false;
  public itemsFound: number = null;
  public searchModalSubscription: Subscription;
  public searchInput = new FormControl('');
  public isLoading = false;
  public isNewsSearchFound: boolean;
  public isTipsSearchFound: boolean;
  public searchValueChanges;
  private currentLanguage: string;
  public searchIcons = searchIcons;
  public searctabindex: SearchService;

  constructor(
    public search: SearchService,
    public dialog: MatDialog,
    private snackBar: MatSnackBarComponent,
    private localStorageService: LocalStorageService,
    public announcer: LiveAnnouncer
  ) {}

  ngOnInit() {
    this.announce();
    this.setupInitialValue();
    this.searchValueChanges = this.searchInput.valueChanges;
    this.searchValueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.resetData();
          this.isLoading = true;
        }),
        switchMap((val: string) => {
          this.currentLanguage = this.localStorageService.getCurrentLanguage();
          return this.search.getAllResults(val, this.currentLanguage);
        })
      )
      .subscribe((data) => this.setData(data));

    this.searchValueChanges.pipe(filter(negate(isNil))).subscribe(() => this.resetData());
  }

  public announce() {
    this.announcer.announce('Welcome to the search window', 'assertive');
  }

  public setupInitialValue(): void {
    this.searchModalSubscription = this.search.searchSubject.subscribe((signal) => this.subscribeToSignal(signal));
  }

  public openErrorPopup(): void {
    this.snackBar.openSnackBar('error');
  }

  private setData({ ecoNews, tipsAndTricks, countOfResults }: SearchModel): void {
    this.isLoading = false;

    this.newsElements = ecoNews;
    this.tipsElements = tipsAndTricks;
    this.itemsFound = countOfResults;
  }

  private subscribeToSignal(signal: boolean): void {
    if (!signal) {
      this.searchInput.reset('', { emitEvent: false });
    }
    this.isSearchClicked = signal;
  }

  public closeSearch(): void {
    this.search.closeSearchSignal();
    this.isSearchClicked = false;
    this.resetData();
  }

  private resetData(): void {
    this.newsElements = [];
    this.tipsElements = [];
    this.itemsFound = null;
  }

  ngOnDestroy() {
    this.searchModalSubscription.unsubscribe();
  }
}
