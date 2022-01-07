import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { MatDrawer } from '@angular/material/sidenav';
import { PlaceService } from '@global-service/place/place.service';
import { redIcon, greenIcon, searchIcon, notification, share, starUnfilled, starHalf, star } from '../../image-pathes/places-icons.js';
import { Place } from './models/place';
import { FilterPlaceService } from '@global-service/filtering/filter-place.service';
import { debounceTime } from 'rxjs/operators';
import { LatLngBounds, LatLngLiteral } from '@agm/core/services/google-maps-types';
import { MapBoundsDto } from './models/map-bounds-dto';
import { MoreOptionsFormValue } from './models/more-options-filter.model';
import { Location } from '@angular-material-extensions/google-maps-autocomplete';
import { FavoritePlaceService } from '@global-service/favorite-place/favorite-place.service';
import { combineLatest } from 'rxjs';
import { initialMoreOptionsFormValue } from './components/more-options-filter/more-options-filter.constant.js';

@Component({
  selector: 'app-places',
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.scss']
})
export class PlacesComponent implements OnInit {
  public position: any = {};
  public zoom = 13;
  public tagList: Array<string> = ['Shops', 'Restaurants', 'Recycling points', 'Events', 'Saved places'];
  public searchName = '';
  public moreOptionsFilters: MoreOptionsFormValue;
  public searchIcon = searchIcon;
  public notification = notification;
  public share = share;
  public basicFilters: string[];
  public mapBoundsDto: MapBoundsDto;
  public places: Place[] = [];
  public readonly redIconUrl: string = redIcon;
  public readonly greenIconUrl: string = greenIcon;
  public activePlace: Place;
  public activePlaceDetails: google.maps.places.PlaceResult;
  public favoritePlaces: Place[] = [];
  public isActivePlaceFavorite = false;
  public readonly tagFilterStorageKey = 'placesTagFilter';
  public readonly moreOptionsStorageKey = 'moreOptionsFilter';

  @ViewChild('drawer') drawer: MatDrawer;

  private map: any;
  private googlePlacesService: google.maps.places.PlacesService;

  constructor(
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private placeService: PlaceService,
    private filterPlaceService: FilterPlaceService,
    private favoritePlaceService: FavoritePlaceService
  ) {}

  ngOnInit() {
    this.filterPlaceService.filtersDto$.pipe(debounceTime(300)).subscribe((filtersDto: any) => {
      this.placeService.updatePlaces(filtersDto);
    });

    this.getMoreOptionsValueFromSessionStorage();

    combineLatest([
      this.placeService.places$,
      this.filterPlaceService.isFavoriteFilter$,
      this.favoritePlaceService.favoritePlaces$
    ]).subscribe(([places, isFavoriteFilter, favoritePlaces]: [Place[], boolean, Place[]]) => {
      this.favoritePlaces = favoritePlaces;
      this.updateIsActivePlaceFavorite();

      if (isFavoriteFilter) {
        this.places = places.filter((place: Place) => {
          return this.favoritePlaces.some((favoritePlace: Place) => favoritePlace.location.id === place.location.id);
        });
      } else {
        this.places = places;
      }
    });

    this.favoritePlaceService.updateFavoritePlaces();

    this.bindLang(this.localStorageService.getCurrentLanguage());
  }

  public onMapIdle(): void {
    this.updateFilters();
  }

  public onMapReady(map: any): void {
    this.map = map;
    this.setUserLocation();
    this.googlePlacesService = new google.maps.places.PlacesService(this.map);
  }

  public mapCenterChange(newValue: LatLngLiteral): void {
    this.position = {
      latitude: newValue.lat,
      longitude: newValue.lng
    };
  }

  public mapBoundsChange(newValue: LatLngBounds): void {
    this.mapBoundsDto = {
      northEastLat: newValue.getNorthEast().lat(),
      northEastLng: newValue.getNorthEast().lng(),
      southWestLat: newValue.getSouthWest().lat(),
      southWestLng: newValue.getSouthWest().lng()
    };
  }

  public moreOptionsChange(newValue: MoreOptionsFormValue): void {
    this.moreOptionsFilters = newValue;
    this.setMoreOptionsValueToSessionStorage(this.moreOptionsFilters);
    this.updateTagFiltersOnMoreOptionsChange();
    this.updateFilters();
  }

  public basicFiltersChange(newValue: string[]) {
    this.basicFilters = newValue;
    this.updateMoreOptionsOnTagFiltersChange(this.basicFilters);
    this.updateFilters();
  }

  public searchNameChange(newValue: string): void {
    this.searchName = newValue;
    this.updateFilters();
  }

  public updateFilters(): void {
    this.filterPlaceService.updateFiltersDto({
      searchName: this.searchName,
      moreOptionsFilters: this.moreOptionsFilters,
      basicFilters: this.basicFilters,
      mapBoundsDto: this.mapBoundsDto,
      position: this.position
    });
  }

  public toggleFavorite(): void {
    if (this.isActivePlaceFavorite) {
      this.favoritePlaceService.deleteFavoritePlace(this.activePlace.id);
    } else {
      this.favoritePlaceService.addFavoritePlace({ placeId: this.activePlace.id, name: this.activePlace.name });
    }
  }

  private bindLang(lang: string): void {
    this.translate.setDefaultLang(lang);
  }

  public selectPlace(place: Place): void {
    this.activePlace = place;
    this.updateIsActivePlaceFavorite();
    this.getPlaceInfoFromGoogleApi(place);
  }

  private getPlaceInfoFromGoogleApi(place: Place) {
    const findByQueryRequest: google.maps.places.FindPlaceFromQueryRequest = {
      query: place.name,
      locationBias: {
        lat: place.location.lat,
        lng: place.location.lng
      },
      fields: ['ALL']
    };

    this.googlePlacesService.findPlaceFromQuery(findByQueryRequest, (places: google.maps.places.PlaceResult[]) => {
      const detailsRequest: google.maps.places.PlaceDetailsRequest = {
        placeId: places[0].place_id,
        fields: ['ALL']
      };
      this.googlePlacesService.getDetails(detailsRequest, (placeDetails: google.maps.places.PlaceResult) => {
        this.activePlaceDetails = placeDetails;
        this.drawer.toggle(true);
      });
    });
  }

  private updateTagFiltersOnMoreOptionsChange(): void {
    const allFilters: [string, boolean][] = Object.entries(this.moreOptionsFilters.baseFilters).concat(
      Object.entries(this.moreOptionsFilters.servicesFilters)
    );
    const currentTagFilter: string[] = this.tagList.reduce((acc, tagName) => {
      const tagFilter: [string, boolean] = allFilters.find((filter: [string, boolean]) => {
        return filter[0] === tagName;
      });
      if (tagFilter && tagFilter[1]) {
        acc.push(tagFilter[0]);
      }
      return acc;
    }, []);

    this.setTagFilterToSessionStorage(currentTagFilter);
  }

  private setTagFilterToSessionStorage(filterValues: string[]): void {
    const previousTagFilters = sessionStorage.getItem(this.tagFilterStorageKey);
    const currentTagFilters = JSON.stringify(filterValues);

    if (previousTagFilters !== currentTagFilters) {
      sessionStorage.setItem(this.tagFilterStorageKey, currentTagFilters);
      this.tagList = [...this.tagList];
    }
  }

  private updateMoreOptionsOnTagFiltersChange(tagFilters: string[]): void {
    if (!this.moreOptionsFilters) {
      return;
    }
    this.moreOptionsFilters = {
      ...this.moreOptionsFilters,
      baseFilters: {
        ...this.moreOptionsFilters.baseFilters,
        ['Saved places']: tagFilters.includes('Saved places')
      },
      servicesFilters: {
        ...this.moreOptionsFilters.servicesFilters,
        ['Shops']: tagFilters.includes('Shops'),
        ['Restaurants']: tagFilters.includes('Restaurants'),
        ['Recycling points']: tagFilters.includes('Recycling points'),
        ['Events']: tagFilters.includes('Events')
      }
    };

    this.setMoreOptionsValueToSessionStorage(this.moreOptionsFilters);
  }

  private setMoreOptionsValueToSessionStorage(formValue: MoreOptionsFormValue): void {
    sessionStorage.setItem(this.moreOptionsStorageKey, JSON.stringify(formValue));
  }

  private getMoreOptionsValueFromSessionStorage(): void {
    const formValue: MoreOptionsFormValue = JSON.parse(sessionStorage.getItem(this.moreOptionsStorageKey));
    this.moreOptionsFilters = formValue ?? initialMoreOptionsFormValue;
  }

  private updateIsActivePlaceFavorite(): void {
    this.isActivePlaceFavorite = this.favoritePlaces.some((favoritePlace: Place) => {
      return favoritePlace.location.id === this.activePlace?.location.id;
    });
  }

  public getStars(rating: number): Array<string> {
    const stars = [];
    const maxRating = 5;
    const validRating = Math.min(rating, maxRating);
    for (let i = 0; i <= validRating - 1; i++) {
      stars.push(star);
    }
    if (Math.trunc(validRating) < validRating) {
      stars.push(starHalf);
    }
    for (let i = stars.length; i < maxRating; i++) {
      stars.push(starUnfilled);
    }
    return stars;
  }

  private setUserLocation(): void {
    navigator.geolocation.getCurrentPosition(
      (position: any) => {
        this.map.setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      () => {
        this.map.setCenter({
          lat: 49.84579567734425,
          lng: 24.025124653312258
        });
      }
    );
  }

  onLocationSelected(event: Location) {
    this.map.setCenter({
      lat: event.latitude,
      lng: event.longitude
    });
  }
}
