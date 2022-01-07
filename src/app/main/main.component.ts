import { TitleAndMetaTagsService } from './service/title-meta-tags/title-and-meta-tags.service';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { LanguageService } from './i18n/language.service';
import { NavigationEnd, Router } from '@angular/router';
import { UiActionsService } from '@global-service/ui-actions/ui-actions.service';
import { UserService } from '@global-service/user/user.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  public toggle: boolean;

  constructor(
    private languageService: LanguageService,
    private titleAndMetaTagsService: TitleAndMetaTagsService,
    private router: Router,
    private uiActionsService: UiActionsService,
    private userService: UserService
  ) {}

  @ViewChild('focusFirst', { static: true }) focusFirst: ElementRef;
  @ViewChild('focusLast', { static: true }) focusLast: ElementRef;

  ngOnInit() {
    this.languageService.setDefaultLanguage();
    this.navigateToStartingPositionOnPage();
    this.titleAndMetaTagsService.useTitleMetasData();
    this.uiActionsService.stopScrollingSubject.subscribe((data) => (this.toggle = data));
  }

  @HostListener('window:beforeunload')
  onExitHandler() {
    this.userService.updateLastTimeActivity();
  }

  public setFocus(): void {
    this.focusFirst.nativeElement.focus();
  }

  public skipFocus(): void {
    this.focusLast.nativeElement.focus();
  }

  private navigateToStartingPositionOnPage(): void {
    this.router.events.subscribe((navigationEvent) => {
      if (navigationEvent instanceof NavigationEnd) {
        window.scroll(0, 0);
      }

      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    });
  }
}
