import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { MainModule } from './main/main.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { UbsModule } from './ubs/ubs.module';
import { appReducers } from './store/reducers/app.reducer';
import { EmployeesEffects } from './store/effects/employee.effects';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MainModule,
    UbsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: LoaderFactory,
        deps: [HttpClient]
      }
    }),
    StoreModule.forRoot(appReducers),
    EffectsModule.forRoot([EmployeesEffects])
  ],
  providers: [
    // we use HashLocationStrategy because
    // so it is to avoid collisions in two types of routes (BE and FE)
    // also this is to stylistically separate them from each other
    // Also some articles write that this is a well-known mistake of the angular SPA and gh-pages
    // and I didn't find how to solve it
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    }
  ],
  bootstrap: [AppComponent],
  exports: [TranslateModule]
})
export class AppModule {}

export function LoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}
