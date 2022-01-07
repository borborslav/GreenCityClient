import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HabitStatus } from '@global-models/habit/HabitStatus.enum';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { HabitMark } from '@global-user/models/HabitMark.enum';
import { take } from 'rxjs/operators';
import { HabitAssignInterface } from 'src/app/main/interface/habit/habit-assign.interface';

@Component({
  selector: 'app-habit-progress',
  templateUrl: './habit-progress.component.html',
  styleUrls: ['./habit-progress.component.scss']
})
export class HabitProgressComponent {
  @Input() habit: HabitAssignInterface;
  public indicator = 7;
  isRequest = false;
  currentDate: string;
  showPhoto: boolean;
  daysCounter: number;
  habitMark: string;
  private descriptionType = {
    acquired: () => {
      this.daysCounter = this.habit.duration;
      this.showPhoto = false;
      this.habitMark = HabitMark.AQUIRED;
    },
    done: () => {
      this.daysCounter = this.habit.workingDays;
      this.showPhoto = false;
      this.habitMark = HabitMark.DONE;
    },
    undone: () => {
      this.daysCounter = this.habit.workingDays;
      this.showPhoto = true;
      this.habitMark = HabitMark.UNDONE;
    }
  };

  @Output() nowAcquiredHabit = new EventEmitter();

  constructor(private habitAssignService: HabitAssignService) {}

  public buildHabitDescription(): void {
    const isDone = this.habit.habitStatusCalendarDtoList.some((item) => item.enrollDate === this.currentDate);
    if (this.habit.status === HabitStatus.ACQUIRED) {
      this.descriptionType.acquired();
    } else if (this.habit.status === HabitStatus.INPROGRESS) {
      if (isDone) {
        this.descriptionType.done();
      } else {
        this.descriptionType.undone();
      }
    }
  }

  public enroll() {
    this.isRequest = true;
    this.habitAssignService
      .enrollByHabit(this.habit.habit.id, this.currentDate)
      .pipe(take(1))
      .subscribe((response: any) => {
        if (response.status === HabitStatus.ACQUIRED) {
          this.descriptionType.acquired();
          this.nowAcquiredHabit.emit(response);
        } else {
          this.habit.habitStatusCalendarDtoList = response.habitStatusCalendarDtoList;
          this.habit.workingDays = response.workingDays;
          this.habit.habitStreak = response.habitStreak;
          this.buildHabitDescription();
          this.isRequest = false;
        }
      });
  }

  public unenroll() {
    this.isRequest = true;
    this.habitAssignService
      .unenrollByHabit(this.habit.habit.id, this.currentDate)
      .pipe(take(1))
      .subscribe((response) => {
        this.habit.habitStatusCalendarDtoList = response.habitStatusCalendarDtoList;
        this.habit.workingDays = response.workingDays;
        this.habit.habitStreak = response.habitStreak;
        this.buildHabitDescription();
        this.isRequest = false;
      });
  }
}
