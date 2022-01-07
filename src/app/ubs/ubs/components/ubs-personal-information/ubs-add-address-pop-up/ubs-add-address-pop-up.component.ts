import { MatSnackBarComponent } from 'src/app/main/component/errors/mat-snack-bar/mat-snack-bar.component';
import { OrderService } from '../../../services/order.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { Address } from '../../../models/ubs.interface';
import { takeUntil, catchError } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-ubs-add-address-pop-up',
  templateUrl: './ubs-add-address-pop-up.component.html',
  styleUrls: ['./ubs-add-address-pop-up.component.scss']
})
export class UBSAddAddressPopUpComponent implements OnInit, OnDestroy {
  country = 'ua';
  options: any;
  cityOptions: any;
  cityBounds: any;
  address: Address;
  updatedAddresses: Address[];
  addAddressForm: FormGroup;
  newAddress: Address;
  region = '';
  isDisabled = false;
  streetPattern = /^[A-Za-zА-Яа-яїЇіІєЄёЁ.\'\-\ \\]+[A-Za-zА-Яа-яїЇіІєЄёЁ0-9.\'\-\ \\]*$/;
  corpusPattern = /^[A-Za-zА-Яа-яїЇіІєЄёЁ0-9]{1,4}$/;
  housePattern = /^[A-Za-zА-Яа-яїЇіІєЄёЁ0-9\.\-\/\,\\]+$/;
  entranceNumberPattern = /^([1-9]\d*)?$/;
  private destroy: Subject<boolean> = new Subject<boolean>();
  currentLocation = {};
  isDistrict = false;
  isKyiv = false;
  cities = [
    { cityName: 'Київ', northLat: 50.59079800991073, southLat: 50.21327301525928, eastLng: 30.82594104187906, westLng: 30.23944009690609 },
    { cityName: 'Гатне' },
    { cityName: 'Горенка' },
    { cityName: `Зазим'є` },
    { cityName: 'Ірпінь' },
    { cityName: 'Княжичі' },
    { cityName: 'Коцюбинське' },
    { cityName: 'Новосілки' },
    { cityName: 'Петропавлівська Борщагівка' },
    { cityName: 'Погреби' },
    { cityName: 'Проліски' },
    { cityName: 'Софіївська Борщагівка' },
    { cityName: 'Чайки' },
    { cityName: 'Щасливе' }
  ];

  bigRegions = ['Київська область'];

  regionsKyiv = [
    'Голосіївський',
    'Дарницький',
    'Деснянський',
    'Дніпровський',
    'Оболонський',
    'Печерський',
    'Подільський',
    'Святошинський',
    `Солом'янський`,
    'Шевченківський'
  ];

  regions = ['Бориспільський', 'Броварський', 'Бучанський', 'Вишгородський', 'Обухівський', 'Фастівський'];

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    public dialogRef: MatDialogRef<UBSAddAddressPopUpComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      edit: boolean;
      address: Address;
      currentLocation: string;
      district: string;
    },
    private snackBar: MatSnackBarComponent
  ) {}

  get getRegion() {
    return this.addAddressForm.get('region');
  }

  get district() {
    return this.addAddressForm.get('district');
  }

  get street() {
    return this.addAddressForm.get('street');
  }

  get houseNumber() {
    return this.addAddressForm.get('houseNumber');
  }

  get houseCorpus() {
    return this.addAddressForm.get('houseCorpus');
  }

  get entranceNumber() {
    return this.addAddressForm.get('entranceNumber');
  }

  get addressComment() {
    return this.addAddressForm.get('addressComment');
  }

  ngOnInit() {
    this.region = this.data.district;
    this.currentLocation = this.data.currentLocation;
    this.addAddressForm = this.fb.group({
      region: [this.data.edit ? this.data.address.region : null, Validators.required],
      city: [this.data.edit ? this.data.address.city : null, Validators.required],
      district: [this.data.edit ? this.data.address.district : '', Validators.required],
      street: [
        this.data.edit ? this.data.address.street : '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(40), Validators.pattern(this.streetPattern)]
      ],
      houseNumber: [
        this.data.edit ? this.data.address.houseNumber : '',
        [Validators.required, Validators.maxLength(4), Validators.pattern(this.housePattern)]
      ],
      houseCorpus: [this.data.edit ? this.data.address.houseCorpus : '', [Validators.maxLength(4), Validators.pattern(this.corpusPattern)]],
      entranceNumber: [
        this.data.edit ? this.data.address.entranceNumber : '',
        [Validators.maxLength(2), Validators.pattern(this.entranceNumberPattern)]
      ],
      addressComment: [this.data.edit ? this.data.address.addressComment : '', Validators.maxLength(255)],
      coordinates: {
        latitude: this.data.edit ? this.data.address.coordinates.latitude : '',
        longitude: this.data.edit ? this.data.address.coordinates.longitude : ''
      },
      id: [this.data.edit ? this.data.address.id : 0],
      actual: true
    });

    // TODO: Must be removed if multi-region feature need to be implemented
    this.addAddressForm.get('region').setValue('Київська область');
    this.addAddressForm.get('region').disable();

    if (this.currentLocation === 'Kyiv' || this.currentLocation === 'Київ') {
      this.isKyiv = true;
      this.isDistrict = true;
      this.addAddressForm.get('city').setValue('Київ');
    }

    // TODO: Must be removed if multi-region feature need to be implemented
    this.onCitySelected('Київ');
  }

  onCitySelected(citySelected: string) {
    this.cities.forEach((city) => {
      if (city.cityName === citySelected) {
        this.cityBounds = {
          north: city.northLat,
          south: city.southLat,
          east: city.eastLng,
          west: city.westLng
        };
      }
    });

    this.options = {
      bounds: this.cityBounds,
      strictBounds: true,
      types: ['address'],
      componentRestrictions: { country: 'UA' }
    };

    this.cityOptions = {
      bounds: this.cityBounds,
      strictBounds: true,
      types: ['(cities)'],
      componentRestrictions: { country: 'UA' }
    };
  }

  onLocationSelected(event): void {
    let g = 0;
    let h = 0;
    let long = 0;
    let lat = 0;
    for (const [key1, value] of Object.entries(event.geometry.viewport)) {
      for (const [key2, val] of Object.entries(value)) {
        g = key2 === 'g' ? val : g;
        h = key2 === 'h' ? val : h;
      }
      if (key1.includes('b')) {
        lat = (g + h) / 2;
      } else {
        long = (g + h) / 2;
      }
    }
    this.addAddressForm.get('coordinates').setValue({
      latitude: lat,
      longitude: long
    });
  }

  setDistrict(event: any) {
    const getDistrict = event.address_components.filter((item) => item.long_name.includes('район'))[0];
    if (getDistrict) {
      this.region = getDistrict.long_name.split(' ')[0];
    }
  }

  onAutocompleteSelected(event): void {
    let streetName = event.name;
    const regExp = /,* \d+/;
    const num = streetName.match(regExp);

    if (num) {
      streetName = streetName.replace(regExp, '');
      num[0] = num[0].length > 2 ? num[0].replace(', ', '') : num[0];
      this.addAddressForm.get('houseNumber').setValue(num[0]);
    }
    this.addAddressForm.get('street').setValue(streetName);
  }

  onDistrictSelected(event): void {
    this.onLocationSelected(event);
    this.setDistrict(event);
    this.onAutocompleteSelected(event);
  }

  selectCity(event: Event): void {
    this.isDistrict = (event.target as HTMLSelectElement).value === 'Київ';
  }

  selectCityApi(event): void {
    this.addAddressForm.get('city').setValue(event?.name);
    this.isDistrict = this.addAddressForm.get('city').value === 'Київ';
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  addAdress() {
    this.isDisabled = true;
    this.addAddressForm.value.region = this.addAddressForm.get('region').value;
    this.orderService
      .addAdress(this.addAddressForm.value)
      .pipe(
        takeUntil(this.destroy),
        catchError((error) => {
          this.snackBar.openSnackBar('existAddress');
          this.dialogRef.close();
          this.isDisabled = false;
          return throwError(error);
        })
      )
      .subscribe((list: Address[]) => {
        this.orderService.setCurrentAddress(this.addAddressForm.value);

        this.updatedAddresses = list;
        this.dialogRef.close();
        this.isDisabled = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.unsubscribe();
  }
}
