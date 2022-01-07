import { Component, Input } from '@angular/core';
import { HabitDto } from '../../../../../../../model/habit/HabitDto';
import { HabitStatisticsDto } from '../../../../../../../model/habit/HabitStatisticsDto';

@Component({
  selector: 'app-habit-estimation',
  templateUrl: './habit-estimation.component.html',
  styleUrls: ['./habit-estimation.component.scss'],
})
export class HabitEstimationComponent {
  @Input()
  habit: HabitDto;
  @Input()
  statistic: HabitStatisticsDto;
}
