import { AllHabitsComponent } from './components/habit/all-habits/all-habits.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent, EditProfileComponent } from './components';
import { AuthPageGuardService } from '../../service/route-guards/auth-page-guard.service';
import { UserComponent } from './user.component';
import { AddNewHabitComponent } from './components/habit/add-new-habit/add-new-habit.component';
import { FriendDashboardComponent } from './components/profile/users-friends/friend-dashboard/friend-dashboard.component';
import { AllFriendsComponent } from './components/profile/users-friends/friend-dashboard/all-friends/all-friends.component';
import { RecommendedFriendsComponent } from './components/profile/users-friends/friend-dashboard/recommended-friends/recommended-friends.component';
import { PendingChangesGuard } from '@global-service/pending-changes-guard/pending-changes.guard';
import { FriendRequestsComponent } from './components/profile/users-friends/friend-dashboard/friend-requests/friend-requests.component';
import { FriendProfilePageComponent } from './components/profile/users-friends/friend-dashboard/friend-profile-page/friend-profile-page.component';

export const userRoutes: Routes = [
  {
    path: '',
    component: UserComponent,
    canActivate: [AuthPageGuardService],
    children: [
      { path: ':id', component: ProfileComponent },
      { path: ':id/edit', component: EditProfileComponent, canDeactivate: [PendingChangesGuard] },
      { path: ':id/allhabits', component: AllHabitsComponent },
      { path: ':id/allhabits/addhabit/:habitId', component: AddNewHabitComponent },
      { path: '', component: ProfileComponent },
      {
        path: ':id/friends',
        component: FriendDashboardComponent,
        children: [
          { path: '', component: AllFriendsComponent },
          { path: 'recommended', component: RecommendedFriendsComponent },
          { path: 'requests', component: FriendRequestsComponent }
        ]
      },
      { path: ':id/friends/:userName/:userId', component: FriendProfilePageComponent },
      { path: ':id/friends/recommended/:userName/:userId', component: FriendProfilePageComponent },
      { path: '', redirectTo: ':id', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(userRoutes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
