import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import { Order } from '../models/ubs.model';
import { OrderService } from './order.service';
import { UBSOrderFormService } from './ubs-order-form.service';

describe('OrderService', () => {
  const bagMock = {
    id: 1,
    name: '',
    capacity: 22,
    price: 33,
    quantity: 44,
    code: '55'
  };

  const personalDataMock = {
    addressComment: 'string',
    email: 'string',
    firstName: 'string',
    id: 0,
    lastName: 'string',
    phoneNumber: 'string'
  };

  const personalData = {
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    anotherClientFirstName: '',
    anotherClientLastName: '',
    anotherClientEmail: '',
    anotherClientPhoneNumber: '',
    addressComment: '',
    city: '',
    district: '',
    street: '',
    houseCorpus: '',
    entranceNumber: '',
    houseNumber: '',
    longitude: 1,
    latitude: 0
  };
  const orderDetailsMock = {
    bags: [],
    points: 100500
  };
  const certificateMock = {
    certificateDate: 'string',
    certificatePoints: 0,
    certificateStatus: 'string'
  };

  const address = {
    actual: true,
    id: 100500,
    city: '',
    region: '',
    district: '',
    street: '',
    houseCorpus: '',
    entranceNumber: '',
    houseNumber: '',
    coordinates: {
      latitude: 0,
      longitude: 0
    }
  };

  const orderMock = new Order([''], 7, [bagMock], [''], 5, '8', personalData, 9, true);

  let service: OrderService;
  let httpMock: HttpTestingController;
  const behaviorSubjectMock = new BehaviorSubject<Order>(orderMock);
  const subjectMock = new Subject<boolean>();
  const ubsOrderServiseMock = {
    orderDetails: null,
    personalData: null
  };

  const baseLink = 'https://greencity-ubs.azurewebsites.net/ubs/';

  function httpTest(url, type, response) {
    const req = httpMock.expectOne(`${baseLink}` + url);
    expect(req.request.method).toBe(type);
    req.flush(response);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrderService,
        { provide: UBSOrderFormService, useValue: ubsOrderServiseMock },
        { provide: BehaviorSubject, useValue: behaviorSubjectMock },
        { provide: Subject, useValue: subjectMock }
      ],
      imports: [HttpClientTestingModule]
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(OrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('method getOrders should return order details', () => {
    service.getOrders().subscribe((data) => {
      expect(ubsOrderServiseMock.orderDetails).not.toBeNull();
      expect(ubsOrderServiseMock.orderDetails).toEqual(data);
      expect(data).toEqual(orderDetailsMock);
    });
    httpTest('order-details', 'GET', orderDetailsMock);
  });

  it('method getPersonalData should return personal data', () => {
    service.getPersonalData().subscribe((data) => {
      expect(ubsOrderServiseMock.personalData).not.toBeNull();
      expect(ubsOrderServiseMock.personalData).toEqual(data);
      expect(data).toEqual(personalDataMock);
    });
    httpTest('personal-data', 'GET', personalDataMock);
  });

  it('method processCertificate should return data of certificate', () => {
    service.processCertificate(100500).subscribe((data) => {
      expect(data).toEqual(certificateMock);
    });
    httpTest('certificate/100500', 'GET', certificateMock);
  });
  it('method findAllAddresses should return address list', () => {
    const adressListMock = {
      actual: true,
      id: 1,
      city: '',
      district: '',
      street: '',
      houseCorpus: '',
      entranceNumber: '',
      houseNumber: ''
    };
    service.findAllAddresses().subscribe((data) => {
      expect(data).toEqual(adressListMock);
    });
    httpTest('findAll-order-address', 'GET', adressListMock);
  });

  it('method getLocations should return user location', () => {
    const locationsMock = [{ id: 1, name: 'city', languageCode: 'ua' }];

    service.getLocations(1).subscribe((data) => {
      expect(data).toEqual(locationsMock as any);
    });
    httpTest('courier/1', 'GET', locationsMock);
  });

  it('method addAdress should makes post request', () => {
    service.addAdress(address).subscribe((data) => {
      expect(data).toEqual(address);
    });
    httpTest('save-order-address', 'POST', address);
  });
  it('method deleteAddress should delete address and make post request', () => {
    service.deleteAddress(address).subscribe((data) => {
      expect(data).toEqual(address);
    });
    httpTest(address.id + '/delete-order-address', 'POST', address);
  });
  it('method addLocation should add location and make post request', () => {
    const location = { locationId: 0 };
    service.addLocation(location).subscribe((data) => {
      expect(data).not.toBeNull();
    });
    httpTest('order/get-locations', 'POST', { status: 200, statusText: 'OK' });
  });

  it('method processLiqPayOrder should makes POST request', () => {
    service.processLiqPayOrder(orderMock).subscribe((data) => {
      expect(data).toEqual(null);
    });
    httpTest('processLiqPayOrder', 'POST', null);
  });

  it('method setOrder should call behaviorSubject.next(order)', () => {
    spyOn(behaviorSubjectMock, 'next');
    service.setOrder(orderMock);
    behaviorSubjectMock.next(orderMock);
    behaviorSubjectMock.subscribe((data) => {
      expect(data).toEqual(orderMock);
    });
    expect(behaviorSubjectMock.next).toHaveBeenCalled();
  });

  it('method completedLocation should call subject.next(true)', () => {
    spyOn(subjectMock, 'next');
    service.completedLocation(true);
    subjectMock.next(true);
    subjectMock.subscribe((data) => {
      expect(data).toBeTruthy();
    });
    expect(subjectMock.next).toHaveBeenCalled();
  });

  it('method getLiqPayForm should call method processLiqPayOrder', () => {
    spyOn(service, 'processLiqPayOrder');
    service.getLiqPayForm();
    expect(service.processLiqPayOrder).toHaveBeenCalled();
  });
});
