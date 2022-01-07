import { authImages, ubsAuthImages } from './../../../../image-pathes/auth-images';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent implements OnInit, OnDestroy {
  private destroySub: Subject<boolean> = new Subject<boolean>();
  public authImages: { mainImage: string; cross: string; hiddenEye: string; openEye: string; google: string };
  public authPage: string;
  public authImageValue: boolean;

  constructor(
    private announcer: LiveAnnouncer,
    public matDialogRef: MatDialogRef<AuthModalComponent>,
    private localeStorageService: LocalStorageService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit(): void {
    this.localeStorageService.ubsRegBehaviourSubject.pipe(takeUntil(this.destroySub)).subscribe((value) => (this.authImageValue = value));
    this.authImages = this.authImageValue ? ubsAuthImages : authImages;
    this.setAuthPage();
    this.announce();
  }

  public announce() {
    this.announcer.announce('Welcome to login page', 'assertive');
  }

  public changeAuthPage(page: string): void {
    this.authPage = page;
  }

  public closeWindow(): void {
    this.matDialogRef.close();
  }

  private setAuthPage(): void {
    this.authPage = this.data.popUpName;
  }

  ngOnDestroy() {
    this.destroySub.next(true);
    this.destroySub.unsubscribe();
  }
}
