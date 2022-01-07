import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FilterDiscountDtoModel } from '@global-models/filtering/filter-discount-dto.model';
import { FilterDistanceDto } from '@global-models/filtering/filter-distance-dto.model';
import { FilterPlaceDtoModel } from '@global-models/filtering/filter-place-dto.model';
import { placeLink } from '../../links';
import { WeekDays } from '../../model/weekDays.model';
import { FilterPlaceService } from '../filtering/filter-place.service';
import { PlaceService } from './place.service';

const placeInfo = {
  id: 5,
  name: 'Kryivka',
  category: {
    name: 'string'
  },
  location: {
    id: 5,
    lat: 49.841311,
    lng: 24.03229,
    address: 'Площа Ринок, 14 (підвал), Львів, Львівська область, 79000'
  },
  openingHoursList: [
    {
      id: 23,
      openTime: '06:00',
      closeTime: '20:00',
      weekDay: WeekDays.WEDNESDAY,
      breakTime: null
    }
  ],
  discountValues: [
    {
      value: 93,
      specification: {
        name: 'Ukrainian food'
      }
    }
  ],
  comments: [],
  rate: 5
};
const placesByStatus = {
  page: [],
  totalElements: 0,
  currentPage: 0,
  totalPages: 0
};
const mapBounds = {
  northEastLat: 89,
  northEastLng: 92,
  southWestLat: 69,
  southWestLng: 86
};
const discountDto = new FilterDiscountDtoModel({ name: '' }, { id: 1, name: '' }, 2, 3);
const distanceFromUserDto = new FilterDistanceDto(77, 88, 99);
const STATUSES = ['PROPOSED', 'DECLINED', 'APPROVED', 'DELETED'];

describe('PlaceService', () => {
  let service: PlaceService;
  let httpMock: HttpTestingController;
  const filterServiceMock = jasmine.createSpyObj('FilterPlaceService', ['getFilters']);

  function httpTest(url, type, response) {
    const req = httpMock.expectOne(`${placeLink}` + url);
    expect(req.request.method).toBe(type);
    req.flush(response);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlaceService, { provide: FilterPlaceService, useValue: filterServiceMock }],
      imports: [HttpClientTestingModule]
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(PlaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getPlaceInfo: should get info about place', async () => {
    service.getPlaceInfo(5).subscribe((data) => {
      expect(data).toBe(placeInfo);
    });
    httpTest('info/5', 'GET', placeInfo);
  });

  it('getFavoritePlaceInfo: shoul return info about favourite place', () => {
    service.getFavoritePlaceInfo(5).subscribe((data) => {
      expect(data).toBe(placeInfo);
    });
    httpTest('info/favorite/5', 'GET', placeInfo);
  });

  it('getPlacesByStatus: should get  place by status', () => {
    service.getPlacesByStatus('PROPOSED', '?page=0&size=5').subscribe((data) => {
      expect(data).toBe(placesByStatus);
    });
    httpTest('PROPOSED?page=0&size=5', 'GET', placesByStatus);
  });

  it('getPlaceByID: should retrurn place by id', () => {
    service.getPlaceByID(5).subscribe((data) => {
      expect(data).toBe(placeInfo);
    });
    httpTest('about/5', 'GET', placeInfo);
  });

  it('getStatuse: should get statuses', () => {
    service.getStatuses().subscribe((data) => {
      expect(data).toBe(STATUSES);
    });
    httpTest('statuses', 'GET', STATUSES);
  });

  it('getFilteredPlaces: should call dependency methods', () => {
    service.getFilteredPlaces();
    expect(filterServiceMock.getFilters).toHaveBeenCalled();
    // @ts-ignore
    expect(filterServiceMock.getFilters.calls.count()).toBe(1);

    httpTest('filter', 'POST', {});
  });

  it('updatePlaceStatus: should send patch request', () => {
    const queryData = {
      id: 1,
      status: 'PROPOSED'
    };
    service.updatePlaceStatus(1, 'PROPOSED').subscribe((data) => {
      expect(data).toEqual(queryData);
    });
    httpTest('status', 'PATCH', queryData);
  });

  it('bulkUpdatePlaceStatuses: should send patch request', () => {
    const response = [{ id: 0, status: 'PROPOSED' }];
    service.bulkUpdatePlaceStatuses([], '').subscribe((data) => {
      expect(data).toEqual(response);
    });
    httpTest('statuses', 'PATCH', response);
  });

  it('delete: should delete place ', () => {
    const id = 1;
    service.delete(id).subscribe((data) => {
      expect(data).toEqual(0);
    });
    httpTest(id, 'DELETE', 0);
  });

  it('bulkDelete: should Bulk delete places', () => {
    const ids = [];
    service.bulkDelete(ids).subscribe((data) => {
      expect(data).toEqual(0);
    });
    httpTest('?ids=', 'DELETE', 0);
  });

  it('filterByRegex: should send post request', () => {
    const filterDto = new FilterPlaceDtoModel(1, mapBounds, discountDto, distanceFromUserDto, '', '');
    const response = {
      page: [
        {
          id: 1,
          name: '',
          location: { lat: 1, lng: 1 },
          category: { name: '' },
          author: {
            id: 1,
            firstName: '',
            lastName: '',
            email: ''
          },
          openingHoursList: [{ openTime: '8:00', closeTime: '20:00', weekDay: 'MONDAY' }],
          modifiedDate: '',
          status: '',
          isSelected: true
        }
      ],
      totalElements: 22,
      currentPage: 0
    };
    service.filterByRegex('', filterDto).subscribe((data) => {
      expect(data).toBe(response);
    });
    httpTest('filter/predicate&sort=modifiedDate,desc', 'POST', response);
  });

  it('updatePlace: should update place and return object', () => {
    service.updatePlace(placeInfo).subscribe((data) => {
      expect(data).toBe(placeInfo);
    });
    httpTest('update', 'PUT', placeInfo);
  });
});
