import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { AgmDirectionModule } from 'agm-direction';
import { CommonModule } from '@angular/common';
import { PlacesRoutesModule } from './places-routing.module';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { AgmCoreModule } from '@agm/core';
import { RatingModule } from 'ngx-bootstrap/rating';
import { Ng5SliderModule } from 'ng5-slider';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedMainModule } from '../shared/shared-main.module';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { PlacesComponent } from './places.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { environment } from '@environment/environment.js';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRippleModule } from '@angular/material/core';
import { MoreOptionsFilterComponent } from './components/more-options-filter/more-options-filter.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { AddPlaceComponent } from './components/add-place/add-place.component';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
  declarations: [PlacesComponent, MoreOptionsFilterComponent, AddPlaceComponent],
  imports: [
    MatSidenavModule,
    SharedModule,
    SharedMainModule,
    CommonModule,
    PlacesRoutesModule,
    AgmDirectionModule,
    Ng2SearchPipeModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    ReactiveFormsModule,
    AgmCoreModule.forRoot({
      apiKey: environment.apiMapKey
    }),
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    RatingModule,
    Ng5SliderModule,
    MatDialogModule,
    NgbModule,
    MatRippleModule,
    MatTabsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      isolate: true
    }),
    MatSliderModule,
    MatGoogleMapsAutocompleteModule
  ],
  providers: [TranslateService]
})
export class PlacesModule {}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
