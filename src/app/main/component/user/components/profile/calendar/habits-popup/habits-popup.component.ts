import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { calendarIcons } from 'src/app/main/image-pathes/calendar-icons';
import { HabitPopupInterface } from '../habit-popup-interface';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { HabitStatusCalendarListInterface } from '../../../../../../interface/habit/habit-assign.interface';
import { LanguageService } from '../../../../../../i18n/language.service';

@Component({
  selector: 'app-habits-popup',
  templateUrl: './habits-popup.component.html',
  styleUrls: ['./habits-popup.component.scss']
})
export class HabitsPopupComponent implements OnInit, OnDestroy {
  language: string;
  today: string;
  calendarIcons = calendarIcons;
  habitsCalendarSelectedDate: string;
  isHabitListEditable: boolean;
  popupHabits: HabitPopupInterface[];
  arrayOfDate: Array<HabitStatusCalendarListInterface>;
  trimWidth = 30;
  destroy = new Subject<void>();
  arrayOfDay: any;
  habitStreak = 0;
  currentDate: any;

  constructor(
    public dialogRef: MatDialogRef<HabitsPopupComponent>,
    public habitAssignService: HabitAssignService,
    public languageService: LanguageService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      habitsCalendarSelectedDate: string;
      isHabitListEditable: boolean;
      habits: HabitPopupInterface[];
    }
  ) {}

  ngOnInit() {
    this.loadPopup();
    this.closePopup();
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString().split('.').reverse().join('-');
  }

  loadPopup() {
    this.language = this.languageService.getCurrentLanguage();
    this.habitsCalendarSelectedDate = this.data.habitsCalendarSelectedDate;
    this.isHabitListEditable = this.data.isHabitListEditable;
    this.popupHabits = this.data.habits.map((habit) => Object.assign({}, habit));
    this.today = this.formatSelectedDate().toString();
  }

  closePopup() {
    this.dialogRef
      .beforeClosed()
      .pipe(takeUntil(this.destroy))
      .subscribe(() => this.dialogRef.close(this.popupHabits));
  }

  formatSelectedDate() {
    const today = new Date();
    const monthLow = today.toLocaleDateString(this.language, { month: 'long' });
    const month = monthLow.charAt(0).toUpperCase() + monthLow.slice(1);
    const day = today.getDate();
    const year = today.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  setWorkingDaysForVisibleHabit(enrolled: boolean, id) {
    const valueHabitsInProgressToView = this.habitAssignService.habitsInProgressToView.find((item) => item.habit.id === id);
    const valueHabitsInProgress = this.habitAssignService.habitsInProgress.find((item) => item.habit.id === id);
    if (valueHabitsInProgressToView !== undefined) {
      enrolled ? valueHabitsInProgressToView.workingDays++ : valueHabitsInProgressToView.workingDays--;
      this.habitAssignService.habitsInProgressToView = this.habitAssignService.habitsInProgressToView.map((obj) => ({ ...obj }));
    } else {
      enrolled ? valueHabitsInProgress.workingDays++ : valueHabitsInProgress.workingDays--;
      this.habitAssignService.habitsInProgress = this.habitAssignService.habitsInProgress.map((obj) => ({ ...obj }));
    }
  }

  public sortByDueDate(): void {
    this.arrayOfDay.sort((a, b) => {
      return b.getTime() - a.getTime();
    });
  }

  setHabitStreak(array: any, id: number, isEnrolled: boolean, isExistArray: any) {
    if (!this.habitAssignService.mapOfArrayOfAllDate.has(id)) {
      this.arrayOfDay = array.map((item) => new Date(item.enrollDate));
      this.habitAssignService.mapOfArrayOfAllDate.set(id, this.arrayOfDay);
    }
    this.arrayOfDay = this.habitAssignService.mapOfArrayOfAllDate.get(id);
    const dataExistArray = this.arrayOfDay.some((item) => item.getDate() === this.habitAssignService.habitDate.getDate());
    if (isEnrolled && !dataExistArray) {
      this.arrayOfDay.push(this.habitAssignService.habitDate);
    } else if (!isEnrolled && dataExistArray) {
      this.arrayOfDay = this.arrayOfDay.filter((day) => day.getDate() !== this.habitAssignService.habitDate.getDate());
    }
    this.sortByDueDate();
    this.habitAssignService.mapOfArrayOfAllDate.set(id, this.arrayOfDay);
    this.currentDate = new Date();
    for (const value of this.arrayOfDay) {
      if (this.currentDate.getDate() !== value.getDate()) {
        break;
      }
      this.habitStreak++;
      this.currentDate.setDate(this.currentDate.getDate() - 1);
    }
    this.updateHabitsCardsCircleAndStreak(id, isExistArray, this.habitStreak);
    this.habitStreak = 0;
  }

  updateHabitsCardsCircleAndStreak(id: number, isExistArray: any, value: any) {
    const ifValueNumber = Number.isInteger(value);
    const visitableArray = this.habitAssignService.habitsInProgressToView.find((item) => item.habit.id === id);
    const invisibleArray = this.habitAssignService.habitsInProgress.find((item) => item.habit.id === id);
    if (isExistArray !== undefined) {
      if (ifValueNumber) {
        visitableArray.habitStreak = value;
      } else {
        visitableArray.habitStatusCalendarDtoList = value;
      }
    } else {
      if (ifValueNumber) {
        invisibleArray.habitStreak = value;
      } else {
        invisibleArray.habitStatusCalendarDtoList = value;
      }
    }
  }

  setCircleFromPopUpToCards(id: number, habitIndex: number, isEnrolled: boolean) {
    const isExistArray = this.habitAssignService.habitsInProgressToView.find((item) => item.habit.id === id);
    this.setWorkingDaysForVisibleHabit(isEnrolled, id);
    this.arrayOfDate = this.habitAssignService.habitsInProgress.find((item) => item.habit.id === id).habitStatusCalendarDtoList;
    if (this.habitsCalendarSelectedDate === this.today) {
      if (isEnrolled) {
        this.arrayOfDate.push({ enrollDate: this.formatDate(new Date()), id: null });
      } else {
        this.arrayOfDate = this.arrayOfDate.filter((item) => item.enrollDate !== this.formatDate(new Date()));
      }
      this.updateHabitsCardsCircleAndStreak(id, isExistArray, this.arrayOfDate);
    }
    this.setHabitStreak(this.arrayOfDate, id, isEnrolled, isExistArray);
  }

  toggleEnrollHabit(id: number) {
    const habitIndex = this.popupHabits.findIndex((habit) => habit.habitId === id);
    this.popupHabits[habitIndex].enrolled = !this.popupHabits[habitIndex].enrolled;
    this.setCircleFromPopUpToCards(id, habitIndex, this.popupHabits[habitIndex].enrolled);
  }

  showTooltip(habit) {
    return habit.habitName.length < this.trimWidth;
  }
}
