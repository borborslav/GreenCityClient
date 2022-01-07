export interface HabitPopupInterface {
  enrolled: boolean;
  habitDescription: string;
  habitId: number;
  habitName: string;
}

export interface HabitsForDateInterface {
  enrollDate: string;
  habitAssigns: Array<HabitPopupInterface>;
}
