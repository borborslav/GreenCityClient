import { ConfirmRestorePasswordGuard } from './main/service/route-guards/confirm-restore-password.guard';
import { HomepageComponent } from 'src/app/main/component/home/components';
import { ConfirmRestorePasswordComponent } from '@global-auth/index';
import { SearchAllResultsComponent } from 'src/app/main/component/layout/components';
import { TipsListComponent } from './main/component/home/components/useful-tips/tips-list/tips-list.component';
import { MainComponent } from './main/main.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { UbsUserGuardGuard } from './ubs/ubs-user/ubs-user-guard.guard';
import { UbsAdminGuardGuard } from './ubs/ubs-admin/ubs-admin-guard.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'about',
        loadChildren: () => import('./main/component/about/about.module').then((mod) => mod.AboutModule)
      },
      {
        path: 'places',
        loadChildren: () => import('./main/component/places/places.module').then((mod) => mod.PlacesModule)
      },
      {
        path: 'news',
        loadChildren: () => import('./main/component/eco-news/eco-news.module').then((mod) => mod.EcoNewsModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./main/component/user/user.module').then((mod) => mod.UserModule)
      },
      {
        path: 'tips',
        component: TipsListComponent
      },
      {
        path: 'search',
        component: SearchAllResultsComponent
      },
      {
        path: 'auth/restore',
        component: ConfirmRestorePasswordComponent,
        canActivate: [ConfirmRestorePasswordGuard]
      },
      {
        path: '',
        pathMatch: 'full',
        component: HomepageComponent
      }
    ]
  },
  {
    path: 'ubs',
    loadChildren: () => import('./ubs/ubs/ubs-order.module').then((mod) => mod.UbsOrderModule)
  },
  {
    path: 'ubs-admin',
    loadChildren: () => import('./ubs/ubs-admin/ubs-admin.module').then((mod) => mod.UbsAdminModule),
    canLoad: [UbsAdminGuardGuard]
  },
  {
    path: 'ubs-user',
    loadChildren: () => import('./ubs/ubs-user/ubs-user.module').then((mod) => mod.UbsUserModule),
    canLoad: [UbsUserGuardGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload', preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
