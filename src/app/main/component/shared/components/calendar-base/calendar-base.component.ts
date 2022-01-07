import { LanguageService } from 'src/app/main/i18n/language.service';
import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { Subject, Subscription } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CalendarInterface } from '@global-user/components/profile/calendar/calendar-interface';
import { calendarImage } from './calendar-image';
import { HabitsPopupComponent } from '@global-user/components/profile/calendar/habits-popup/habits-popup.component';
import { HabitsForDateInterface } from '@global-user/components/profile/calendar/habit-popup-interface';
import { ItemClass } from './CalendarItemStyleClasses';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-calendar-base',
  template: ''
})
export class CalendarBaseComponent implements OnDestroy {
  public calendarImages = calendarImage;
  public monthAndYearName: string;
  public yearData: number;
  public activeMonth: string;
  public monthView = true;
  public daysName: Array<string> = [];
  public months: Array<string> = [];
  public monthsShort: Array<string> = [];
  public monthsCalendar: Array<string> = [];
  public calendarDay: Array<CalendarInterface> = [];
  public currentDayName: string;
  public language: string;
  public currentMonth = new Date().getMonth();
  public currentYear = new Date().getFullYear();
  public selectedDay;
  public isDayTracked;
  public habits;
  public isFetching;
  public checkIfFuture;
  public toggleEnrollHabit;
  public langChangeSub: Subscription;
  public defaultTranslateSub: Subscription;
  private destroySub = new Subject<void>();

  public calendar: CalendarInterface = {
    date: new Date(),
    numberOfDate: 0,
    year: 0,
    month: 0,
    firstDay: 0,
    dayName: '',
    totalDaysInMonth: 0,
    hasHabitsInProgress: false,
    areHabitsDone: false,
    isCurrentDayActive: false
  };

  public userHabitsList: Array<HabitsForDateInterface>;
  public currentDayItem: CalendarInterface;
  public isCheckedHabits: boolean;
  public checkAnswer = false;
  public isHabitListEditable: boolean;
  public daysCanEditHabits = 7;

  constructor(
    public translate: TranslateService,
    public languageService: LanguageService,
    public habitAssignService: HabitAssignService,
    public dialog: MatDialog
  ) {}

  ngOnDestroy() {
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
    if (this.defaultTranslateSub) {
      this.defaultTranslateSub.unsubscribe();
    }
    this.destroySub.next();
    this.destroySub.complete();
  }

  public toggleCalendarView(): void {
    this.monthView = !this.monthView;
    this.yearData = this.currentYear;
  }

  public getDaysInMonth(iMonth, iYear): number {
    return new Date(iYear, iMonth + 1, 0).getDate();
  }

  public subscribeToLangChange(): void {
    this.langChangeSub = this.translate.onDefaultLangChange.subscribe((res) => {
      const translations = res.translations.profile.calendar;
      this.daysName = translations.days;
      this.months = translations.months;
      this.monthsShort = translations.monthsShort;
      this.monthAndYearName = `${this.months[this.currentMonth]} ${this.currentYear}`;
      this.markCurrentDayOfWeek();
      this.buildMonthCalendar(this.monthsShort);
      this.getUserHabits(true, this.calendarDay);
    });
  }

  public bindDefaultTranslate(): void {
    this.defaultTranslateSub = this.translate.getTranslation(this.translate.getDefaultLang()).subscribe((res) => {
      const translations = res.profile.calendar;
      this.daysName = translations.days;
      this.months = translations.months;
      this.monthsShort = translations.monthsShort;
      this.monthAndYearName = `${this.months[this.currentMonth]} ${this.currentYear}`;
      this.markCurrentDayOfWeek();
      this.buildMonthCalendar(this.monthsShort);
    });
  }

  public buildCalendar(): void {
    this.calculateCalendarModel(this.currentMonth, this.currentYear);
    this.bindCalendarModel();
    this.setEmptyDays();
    this.isCurrentDayActive();
  }

  public calculateCalendarModel(month: number, year: number): void {
    this.calendar.month = month;
    this.calendar.year = year;
    this.calendar.firstDay = new Date(year, month, 0).getDay();
    this.calendar.totalDaysInMonth = this.getDaysInMonth(month, year);
    this.monthAndYearName = `${this.months[month]} ${year}`;
  }

  public bindCalendarModel(): void {
    const end = this.calendar.totalDaysInMonth;
    const calendarDays = Array.from({ length: end }, (_, i) => this.getMonthTemplate(i + 1));
    this.calendarDay = [...this.calendarDay, ...calendarDays];
  }

  public setEmptyDays(): void {
    const end = this.calendar.firstDay;
    const emptyDays = Array.from({ length: end }, () => this.getMonthTemplate());
    this.calendarDay = [...emptyDays, ...this.calendarDay];
  }

  public getMonthTemplate(days?: number): CalendarInterface {
    return {
      numberOfDate: days || '',
      date: new Date(),
      month: this.calendar.month,
      year: this.calendar.year,
      firstDay: this.calendar.firstDay,
      totalDaysInMonth: this.calendar.totalDaysInMonth,
      dayName: new Date(this.calendar.year, this.calendar.month, days).toDateString().substring(0, 3) || '',
      hasHabitsInProgress: false,
      areHabitsDone: false,
      isCurrentDayActive: false
    };
  }

  public isCurrentDayActive(): void {
    this.calendarDay.forEach(
      (el) =>
        (el.isCurrentDayActive =
          el.date.getDate() === el.numberOfDate && el.date.getMonth() === el.month && el.date.getFullYear() === el.year)
    );
  }

  public markCurrentDayOfWeek(): void {
    const option: any = { weekday: 'short' };
    this.language = this.languageService.getCurrentLanguage();
    this.calendarDay.forEach((el) => {
      if (el.isCurrentDayActive && el.date.getMonth() === el.month && el.date.getFullYear() === el.year) {
        const dayName = new Date(el.year, el.month, Number(el.numberOfDate)).toLocaleDateString(this.language, option);
        this.currentDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      }
    });
  }

  public nextMonth(): void {
    this.currentYear = this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear;
    this.currentMonth = (this.currentMonth + 1) % 12;
    this.calendarDay = [];
    this.buildCalendar();
    this.getUserHabits(true, this.calendarDay);
  }

  public previousMonth(): void {
    this.currentYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
    this.currentMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
    this.calendarDay = [];
    this.buildCalendar();
    this.getUserHabits(true, this.calendarDay);
  }

  public buildMonthCalendar(months): void {
    this.yearData = this.currentYear;
    this.monthsCalendar = months;
    this.isActiveMonth();
  }

  public isActiveMonth(): void {
    this.activeMonth = this.calendarDay
      .filter((item) => item.isCurrentDayActive)
      .map((el) => this.monthsShort[el.month])
      .toString();
  }

  public previousYear(): void {
    this.yearData = this.yearData - 1;
  }

  public nextYear(): void {
    this.yearData = this.yearData + 1;
  }

  public buildSelectedMonthCalendar(month): void {
    this.monthView = true;
    this.currentMonth = this.monthsShort.indexOf(month);
    this.currentYear = this.yearData;
    this.calendarDay = [];
    this.buildCalendar();
  }

  public formatDate(isMonthCalendar: boolean, dayItem) {
    if (isMonthCalendar) {
      return `${dayItem.year}-${dayItem.month + 1 < 10 ? '0' + (dayItem.month + 1) : dayItem.month + 1}-${
        dayItem.numberOfDate < 10 ? '0' + dayItem.numberOfDate : dayItem.numberOfDate
      }`;
    } else {
      return `${dayItem.date.getFullYear()}-${
        dayItem.date.getMonth() + 1 < 10 ? '0' + (dayItem.date.getMonth() + 1) : dayItem.date.getMonth() + 1
      }-${dayItem.date.getDate() < 10 ? '0' + dayItem.date.getDate() : dayItem.date.getDate()}`;
    }
  }

  formatSelectedDate(isMonthCalendar, dayItem: CalendarInterface) {
    if (isMonthCalendar) {
      return `${this.months[dayItem.month]} ${dayItem.numberOfDate}, ${dayItem.year}`;
    } else {
      const month = dayItem.date.toLocaleDateString(this.language, { month: 'long' });
      const day = dayItem.date.getDate();
      const year = dayItem.date.getFullYear();
      return `${month} ${day}, ${year}`;
    }
  }

  getHabitsForDay(habitsList, date) {
    return habitsList.find((list) => list.enrollDate === date);
  }

  public getUserHabits(isMonthCalendar, days) {
    const firstDay = isMonthCalendar ? days.find((day) => day.numberOfDate === 1) : days[0];
    const startDate = this.formatDate(isMonthCalendar, firstDay);
    const endDate = this.formatDate(isMonthCalendar, days[days.length - 1]);
    this.habitAssignService
      .getAssignHabitsByPeriod(startDate, endDate)
      .pipe(takeUntil(this.destroySub))
      .subscribe((res) => {
        this.userHabitsList = res;
        this.habitAssignService.habitsFromDashBoard = res;
        days.forEach((day) => {
          const date = this.formatDate(isMonthCalendar, day);
          if (new Date().setHours(0, 0, 0, 0) >= new Date(date).setHours(0, 0, 0, 0)) {
            day.hasHabitsInProgress = this.userHabitsList.filter((habit) => habit.enrollDate === date)[0].habitAssigns.length > 0;
            day.areHabitsDone =
              this.userHabitsList.filter((habit) => habit.enrollDate === date)[0].habitAssigns.filter((habit) => !habit.enrolled).length ===
              0;
          }
        });
      });
  }

  isCheckedAllHabits(habitsForDay) {
    return habitsForDay.find((habit) => !habit.enrolled) ? false : true;
  }

  chooseDisplayClass(dayItem) {
    if (dayItem.isCurrentDayActive) {
      return ItemClass.CURRENT;
    } else if (
      dayItem.hasHabitsInProgress &&
      dayItem.numberOfDate < dayItem.date.getDate() - this.daysCanEditHabits &&
      dayItem.areHabitsDone
    ) {
      return ItemClass.ENROLLEDPAST;
    } else if (
      dayItem.hasHabitsInProgress &&
      dayItem.numberOfDate < dayItem.date.getDate() - this.daysCanEditHabits &&
      !dayItem.areHabitsDone
    ) {
      return ItemClass.UNENROLLEDPAST;
    } else if (dayItem.hasHabitsInProgress && dayItem.areHabitsDone) {
      return ItemClass.ENROLLED;
    } else if (dayItem.hasHabitsInProgress && !dayItem.areHabitsDone) {
      return ItemClass.UNENROLLED;
    }
  }

  checkHabitListEditable(isMonthCalendar, dayItem: CalendarInterface) {
    this.selectedDay = isMonthCalendar ? new Date(dayItem.year, dayItem.month, Number(dayItem.numberOfDate)) : dayItem.date;
    this.isHabitListEditable = false;
    const currentDate: Date = new Date();
    this.isHabitListEditable =
      currentDate.setHours(0, 0, 0, 0) - (this.daysCanEditHabits + 1) * 24 * 60 * 60 * 1000 >=
      new Date(this.selectedDay).setHours(0, 0, 0, 0);
  }

  checkCanOpenPopup(dayItem: CalendarInterface) {
    return dayItem.hasHabitsInProgress ? true : false;
  }

  openDialogDayHabits(event, isMonthCalendar, dayItem: CalendarInterface) {
    const dateForHabitPopup = `${dayItem.year}-${dayItem.month + 1}-${dayItem.numberOfDate}`;
    if (dayItem.numberOfDate) {
      this.habitAssignService.habitDate = new Date(dateForHabitPopup);
    } else {
      this.habitAssignService.habitDate = dayItem.date;
    }
    this.checkHabitListEditable(isMonthCalendar, dayItem);
    const date = this.formatDate(isMonthCalendar, dayItem);
    const habits = this.getHabitsForDay(this.userHabitsList, date);
    const pos = event.target.getBoundingClientRect();
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.backdropClass = 'backdropBackground';
    dialogConfig.position = {
      top: pos.y + 20 + 'px',
      left: pos.x - 300 + 'px'
    };
    dialogConfig.data = {
      habitsCalendarSelectedDate: this.formatSelectedDate(isMonthCalendar, dayItem),
      isHabitListEditable: this.isHabitListEditable,
      habits: habits.habitAssigns
    };
    const dialogRef = this.dialog.open(HabitsPopupComponent, dialogConfig);
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroySub))
      .subscribe((changedList) => {
        this.sendEnrollRequest(changedList, habits.enrollDate);
        this.isCheckedHabits = this.isCheckedAllHabits(changedList);
        this.currentDayItem = dayItem;
      });
  }

  sendEnrollRequest(changedList, date) {
    const habitsForSelectedDay = this.getHabitsForDay(this.userHabitsList, date).habitAssigns;
    habitsForSelectedDay.forEach((habit: any) => {
      const baseHabit: any = changedList.find((list: any) => list.habitId === habit.habitId);
      if (habit.enrolled !== baseHabit.enrolled) {
        habit.enrolled ? this.unEnrollHabit(habit, date) : this.enrollHabit(habit, date);
      }
    });
  }

  enrollHabit(habit, date) {
    this.checkAnswer = true;
    this.habitAssignService
      .enrollByHabit(habit.habitId, date)
      .pipe(
        takeUntil(this.destroySub),
        finalize(() => (this.checkAnswer = false))
      )
      .subscribe(() => {
        habit.enrolled = !habit.enrolled;
        this.currentDayItem.areHabitsDone = this.isCheckedHabits;
      });
  }

  unEnrollHabit(habit, date) {
    this.checkAnswer = true;
    this.habitAssignService
      .unenrollByHabit(habit.habitId, date)
      .pipe(
        takeUntil(this.destroySub),
        finalize(() => (this.checkAnswer = false))
      )
      .subscribe(() => {
        habit.enrolled = !habit.enrolled;
        this.currentDayItem.areHabitsDone = this.isCheckedHabits;
      });
  }
}
