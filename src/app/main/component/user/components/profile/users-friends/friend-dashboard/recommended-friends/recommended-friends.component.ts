import { Component, OnDestroy, OnInit } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { FriendArrayModel, FriendModel } from '@global-user/models/friend.model';
import { UserFriendsService } from '@global-user/services/user-friends.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';

@Component({
  selector: 'app-recommended-friends',
  templateUrl: './recommended-friends.component.html',
  styleUrls: ['./recommended-friends.component.scss']
})
export class RecommendedFriendsComponent implements OnInit, OnDestroy {
  public recommendedFriends: FriendModel[] = [];
  public userId: number;
  private destroy$ = new Subject();
  public scroll = false;
  public currentPage = 0;
  public totalPages: number;
  public isFetching = false;
  public emptySearchList = false;
  public sizePage = 10;
  public searchQuery = '';
  public searchMode = false;
  readonly absent = 'assets/img/noNews.jpg';
  constructor(
    private userFriendsService: UserFriendsService,
    private localStorageService: LocalStorageService,
    private matSnackBar: MatSnackBarComponent
  ) {}

  ngOnInit() {
    this.initUser();
    this.getPossibleFriends(this.userId, this.currentPage);
  }

  public findUserByName(value: string) {
    this.searchQuery = value;
    this.isFetching = true;
    this.searchMode = true;
    this.userFriendsService
      .findNewFriendsByName(value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: FriendArrayModel) => {
          this.emptySearchList = !data.page.length;
          this.recommendedFriends = data.page;
          this.isFetching = false;
          this.searchMode = false;
        },
        (error) => {
          this.matSnackBar.openSnackBar('snack-bar.error.default');
          this.isFetching = false;
          this.searchMode = false;
        }
      );
  }

  public deleteFriendsFromList(id, array) {
    const indexAddedFriend = array.findIndex((item) => item.id === id);
    array.splice(indexAddedFriend, 1);
  }

  public getPossibleFriends(userId: number, currentPage: number) {
    this.isFetching = true;
    this.userFriendsService.getPossibleFriends(userId, currentPage).subscribe(
      (data: FriendArrayModel) => {
        this.totalPages = data.totalPages;
        this.recommendedFriends = this.recommendedFriends.concat(data.page);
        this.emptySearchList = false;
        this.isFetching = false;
        this.scroll = false;
      },
      (error) => {
        this.matSnackBar.openSnackBar('snack-bar.error.default');
        this.isFetching = false;
      }
    );
  }

  public onScroll(): void {
    if (this.scroll || this.emptySearchList) {
      return;
    }
    this.scroll = true;
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
      this.getPossibleFriends(this.userId, this.currentPage);
    }
  }

  public addFriend(id: number) {
    this.userFriendsService
      .addFriend(this.userId, id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.deleteFriendsFromList(id, this.recommendedFriends);
      });
  }

  public initUser(): void {
    this.localStorageService.userIdBehaviourSubject.pipe(takeUntil(this.destroy$)).subscribe((userId: number) => (this.userId = userId));
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
