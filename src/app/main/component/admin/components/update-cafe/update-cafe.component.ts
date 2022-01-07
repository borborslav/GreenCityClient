import { Component, ElementRef, EventEmitter, Inject, Injector, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { LocationDto } from '../../../../model/locationDto.model';
import { DiscountDto } from '../../../../model/discount/DiscountDto';
import { SpecificationNameDto } from '../../../../model/specification/SpecificationNameDto';
import { OpeningHours } from '../../../../model/openingHours.model';
import { WeekDays } from '../../../../model/weekDays.model';
import { BreakTimes } from '../../../../model/breakTimes.model';
import { CategoryDto } from '../../../../model/category.model';
import { PlaceWithUserModel } from '../../../../model/placeWithUser.model';
import { NgForm } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ModalService } from '../../../core/components/propose-cafe/_modal/modal.service';
import { PlaceService } from '../../../../service/place/place.service';
import { CategoryService } from '../../../../service/category.service';
import { SpecificationService } from '../../../../service/specification.service';
import { UserService } from '../../../../service/user/user.service';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import { PlaceUpdatedDto } from '../../models/placeUpdatedDto.model';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-update-cafe',
  templateUrl: './update-cafe.component.html',
  styleUrls: ['./update-cafe.component.scss']
})
export class UpdateCafeComponent implements OnInit {
  private modalService: ModalService;
  private placeService: PlaceService;
  private categoryService: CategoryService;
  private specificationService: SpecificationService;
  private uService: UserService;
  private matSnackBar: MatSnackBarComponent;
  private mapsAPILoader: MapsAPILoader;
  private ngZone: NgZone;

  constructor(private injector: Injector, @Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<UpdateCafeComponent>) {
    this.modalService = injector.get(ModalService);
    this.placeService = injector.get(PlaceService);
    this.categoryService = injector.get(CategoryService);
    this.specificationService = injector.get(SpecificationService);
    this.uService = injector.get(UserService);
    this.matSnackBar = injector.get(MatSnackBarComponent);
    this.mapsAPILoader = injector.get(MapsAPILoader);
    this.ngZone = injector.get(NgZone);
    this.submitButtonEnabled = true;
  }

  name: any;
  nameOfSpecification: any;
  value: any;
  discountsNumber = 101;
  placeName: any;
  address: any;
  place: PlaceUpdatedDto;
  location: LocationDto;
  discountValues: DiscountDto[] = [];
  specification: SpecificationNameDto;
  openingHoursList: OpeningHours[] = [];
  weekDays: WeekDays[] = [
    WeekDays.MONDAY,
    WeekDays.TUESDAY,
    WeekDays.WEDNESDAY,
    WeekDays.THURSDAY,
    WeekDays.FRIDAY,
    WeekDays.SATURDAY,
    WeekDays.SUNDAY
  ];
  openingHours: OpeningHours = new OpeningHours();
  breakTimes: BreakTimes = new BreakTimes();
  categories: any;
  specifications: any;
  category: CategoryDto;
  string: null;
  latitude = 49.841795;
  longitude = 24.031706;
  zoom = 13;
  private geoCoder;
  submitButtonEnabled: boolean;
  isBreakTime = false;
  @Output() newPlaceEvent = new EventEmitter<PlaceWithUserModel>();
  @ViewChild('saveForm', { static: true }) private saveForm: NgForm;
  @ViewChild(NgSelectComponent, { static: true }) ngSelectComponent: NgSelectComponent;
  @ViewChild('search', { static: true })
  public searchElementRef: ElementRef;

  weekDaysNew: WeekDays[] = [];

  ngOnInit() {
    this.placeService.getPlaceByID(this.data).subscribe((data) => {
      this.place = data;
      this.address = this.place.location.address;
      this.latitude = data.location.lat;
      this.longitude = data.location.lng;
      this.zoom = 15;
      this.openingHoursList = data.openingHoursList;
      this.discountValues = data.discountValues;
      this.placeName = data.name;
      this.name = this.place.category.name;

      if (data.openingHoursList.length !== 0) {
        data.openingHoursList.forEach((day) => {
          this.removeDay(day);
        });
        this.weekDays = this.weekDaysNew;
      }
    });

    this.categoryService.findAllCategory().subscribe((data) => {
      this.categories = data;
    });

    this.specificationService.findAllSpecification().subscribe((data) => {
      this.specifications = data;
      this.nameOfSpecification = data.map((res) => res.name);
    });

    this.discountsNumber = Array.apply(null, { length: this.discountsNumber }).map(Number.call, Number);

    // load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder();

      const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ['address']
      });
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          // get the place result
          const place: google.maps.places.PlaceResult = autocomplete.getPlace();

          // verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //  set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 15;
        });
      });
    });
  }

  addDiscountAndSpecification(nameOfSpecification: string, value: number) {
    const discount1 = new DiscountDto();
    discount1.value = value;
    const specification = new SpecificationNameDto();
    specification.name = nameOfSpecification;
    discount1.specification = specification;
    if (this.discountValues.length === 0) {
      this.discountValues.push(discount1);
    } else {
      let exist = false;
      // tslint:disable-next-line:prefer-for-of
      for (const discount of this.discountValues) {
        if (discount1.specification.name === discount.specification.name) {
          this.matSnackBar.openSnackBar('cafeNotificationsExists');
          exist = true;
        }
      }
      if (exist === false) {
        this.discountValues.push(discount1);
      }
    }
  }

  add(openingHours: OpeningHours, breakTimes: BreakTimes) {
    if (openingHours.closeTime < openingHours.openTime || breakTimes.endTime < breakTimes.startTime) {
      this.matSnackBar.openSnackBar('cafeNotificationsCloseTime');
      return;
    }

    const openingHours1 = new OpeningHours();
    openingHours1.closeTime = openingHours.closeTime;
    openingHours1.openTime = openingHours.openTime;
    openingHours1.weekDay = openingHours.weekDay;
    if (breakTimes.endTime && breakTimes.startTime !== undefined) {
      if (breakTimes.startTime > openingHours1.openTime && breakTimes.endTime < openingHours1.closeTime) {
        openingHours1.breakTime = breakTimes;
      } else {
        this.matSnackBar.openSnackBar('cafeNotificationsBreakTime');
        return;
      }
    }
    const weekDaysNew: WeekDays[] = [];
    this.weekDays.forEach((val) => {
      if (val !== openingHours1.weekDay) {
        weekDaysNew.push(val);
      }
    });
    this.weekDays = weekDaysNew;
    this.openingHoursList.push(openingHours1);
    this.openingHours = new OpeningHours();
    this.breakTimes = new BreakTimes();
    this.isBreakTime = false;
  }

  removeDay(openingHours1) {
    this.weekDays.forEach((val) => {
      if (val !== openingHours1.weekDay) {
        this.weekDaysNew.push(val);
      }
    });
  }

  switch() {
    this.isBreakTime = !this.isBreakTime;
  }

  deleteDay(openingHours: OpeningHours) {
    this.openingHoursList = this.openingHoursList.filter((item) => item !== openingHours);
    this.weekDays.push(openingHours.weekDay);
  }

  delete(discount: DiscountDto) {
    this.discountValues = this.discountValues.filter((item) => item !== discount);
  }

  onSubmit() {
    this.placeService.getPlaceByID(this.data).subscribe((data) => {
      this.place = data;
      this.submitButtonEnabled = false;
      this.place.openingHoursList = this.openingHoursList;
      this.place.discountValues = this.discountValues;
      this.place.category.name = this.name;
      this.place.discountValues = this.discountValues;
      this.place.location.address = this.address;
      this.place.location.lat = this.latitude;
      this.place.location.lng = this.longitude;
      this.place.name = this.placeName;
      this.placeService.updatePlace(this.place);
    });
    this.dialogRef.close();
  }

  markerDragEnd($event: MouseEvent) {
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.getAddress(this.latitude, this.longitude);
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 12;
          this.address = results[0].formatted_address;
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }
}
