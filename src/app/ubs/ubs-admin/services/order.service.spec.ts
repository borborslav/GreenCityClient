import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OrderService } from 'src/app/ubs/ubs-admin/services/order.service';

describe('OrderService', () => {
  let httpMock: HttpTestingController;
  let service: OrderService;
  const urlMock = 'https://greencity-ubs.azurewebsites.net/ubs';
  const urlMainMock = 'https://greencity-ubs.azurewebsites.net';
  const userMock = {
    customerName: 'YuraBoiko',
    customerPhoneNumber: '974498935',
    customerEmail: 'yur13boj9@gmail.com',
    recipientName: 'Yura Boiko',
    recipientPhoneNumber: '+380974498935',
    recipientEmail: 'yur13boj9@gmail.com',
    totalUserViolations: 0,
    userViolationForCurrentOrder: 0,
    violations: {
      violationsAmount: 0,
      violationsDescription: {}
    }
  };

  const recipient = {
    recipientEmail: 'fake',
    recipientId: 0,
    recipientName: 'fake',
    recipientPhoneNumber: 'fake',
    recipientSurName: 'fake'
  };

  const address = {
    comment: 'fake',
    district: 'fake',
    entranceNumber: 'fake',
    houseCorpus: 'fake',
    houseNumber: 'fake',
    street: 'fake'
  };

  const arr = [
    { key: 'FORMED' },
    { key: 'ADJUSTMENT' },
    { key: 'BROUGHT_IT_HIMSELF' },
    { key: 'CANCELED' },
    { key: 'CONFIRMED' },
    { key: 'ON_THE_ROUTE' },
    { key: 'DONE' },
    { key: 'NOT_TAKEN_OUT' }
  ];

  const exportMock = {
    allReceivingStations: ['Lviv'],
    exportedDate: '02-11-21',
    exportedTime: '10:14',
    receivingStation: 'Lviv'
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return details of order', () => {
    service.getOrderDetails(2464, 'en').subscribe((data) => {
      expect(data.bagId).toBeTruthy();
    });
    const req = httpMock.expectOne(`${urlMock}/management/read-order-info/2464?language=en`);
    expect(req.request.method).toBe('GET');
  });

  it('should return details of order sum', () => {
    service.getOrderSumDetails(2464).subscribe((data) => {
      expect(data.sumAmount).toBeTruthy();
    });
    const req = httpMock.expectOne(`${urlMock}/management/get-order-sum-detail/871`);
    expect(req.request.method).toBe('GET');
  });

  it('should return user info', () => {
    service.getUserInfo(2270, 'en').subscribe((data) => {
      expect(data).toBe(userMock);
    });
    const req = httpMock.expectOne(`${urlMock}/user-info/2270?lang=en`);
    expect(req.request.method).toBe('GET');
    req.flush(userMock);
  });

  it('should return user violations', () => {
    service.getUserViolations('yur13boj9@gmail.com').subscribe((data) => {
      expect(data).toBe(userMock.violations);
    });
    const req = httpMock.expectOne(`${urlMock}/management/getUsersViolations?email=yur13boj9@gmail.com`);
    expect(req.request.method).toBe('GET');
    req.flush(userMock.violations);
  });

  it('should return payment info', () => {
    service.getPaymentInfo(2270).subscribe((data) => {
      expect(data).toBe({ paidAmount: 0, paymentInfoDtos: [], unPaidAmount: 0 });
    });
    const req = httpMock.expectOne(`${urlMock}/management/getPaymentInfo?orderId=2270`);
    expect(req.request.method).toBe('GET');
  });

  it('should return order address', () => {
    service.readAddressOrder(2270).subscribe((data) => {
      expect(data).toBe(address);
    });
    const req = httpMock.expectOne(`${urlMock}/management/read-address-order/2270`);
    expect(req.request.method).toBe('GET');
    req.flush(address);
  });

  it('should return order export details', () => {
    service.getOrderExportDetails(2270).subscribe((data) => {
      expect(data).toBe(exportMock);
    });
    const req = httpMock.expectOne(`${urlMock}/management/get-order-export-details/2270`);
    expect(req.request.method).toBe('GET');
    req.flush(exportMock);
  });

  it('should return all receiving stations', () => {
    service.getAllReceivingStations().subscribe((data) => {
      expect(data).toBe(exportMock.allReceivingStations);
    });
    const req = httpMock.expectOne(`${urlMainMock}/admin/ubs-employee/get-all-receiving-station`);
    expect(req.request.method).toBe('GET');
    req.flush(exportMock.allReceivingStations);
  });

  it('should return all responsible persons', () => {
    service.getAllResponsiblePersons(0).subscribe((data) => {
      expect(data).toBeDefined();
    });
    const req = httpMock.expectOne(`${urlMock}/management/get-all-employee-by-position/0`);
    expect(req.request.method).toBe('GET');
  });

  it('should return order details status', () => {
    service.getOrderDetailStatus(2500).subscribe((data) => {
      expect(data.orderStatus).toBe('FORMED');
      expect(data.paymentStatus).toBe('UNPAID');
    });
    const req = httpMock.expectOne(`${urlMock}/management/read-order-detail-status/2500`);
    expect(req.request.method).toBe('GET');
  });

  it('should update recipients data', () => {
    service.updateRecipientsData(2500).subscribe((data) => {
      expect(data).toBe(recipient);
    });
    const req = httpMock.expectOne(`${urlMock}`);
    expect(req.request.method).toBe('PUT');
  });

  it('should get column', () => {
    service.getColumnToDisplay().subscribe((data) => {
      expect(data).toEqual({ titles: 'fake' });
    });
    const req = httpMock.expectOne(`${urlMock}/management/getOrdersViewParameters`);
    expect(req.request.method).toBe('GET');
    req.flush({ titles: 'fake' });
  });

  it('should set column to display', () => {
    service.setColumnToDisplay('fake').subscribe((data) => {
      expect(data).toEqual({ titles: 'fake' });
    });
    const req = httpMock.expectOne(`${urlMock}/management/changeOrdersTableView?titles=fake`);
    expect(req.request.method).toBe('PUT');
    req.flush({ titles: 'fake' });
  });

  it('should get overpayment message about overpayment', () => {
    const msg = service.getOverpaymentMsg(1);
    expect(msg).toBe('order-payment.overpayment');
  });

  it('should get overpayment message about underpayment', () => {
    const msg = service.getOverpaymentMsg(-1);
    expect(msg).toBe('order-payment.underpayment');
  });

  it('should return order history', () => {
    service.getOrderHistory(1).subscribe((data) => {
      expect(data).toBe([]);
    });
    const req = httpMock.expectOne(`${urlMock}/order_history/1`);
    expect(req.request.method).toBe('GET');
  });

  it('should return info about order', () => {
    service.getOrderInfo(1, 'en').subscribe((data) => {
      expect(data).toBe(userMock);
    });
    const req = httpMock.expectOne(`${urlMock}/management/get-data-for-order/1/en`);
    expect(req.request.method).toBe('GET');
    req.flush(userMock);
  });

  it('should filter statuses', () => {
    const res = service.filterStatuses(arr, ['FORMED', 'ADJUSTMENT', 'BROUGHT_IT_HIMSELF', 'CANCELED']);
    expect(res).toEqual([{ key: 'FORMED' }, { key: 'ADJUSTMENT' }, { key: 'BROUGHT_IT_HIMSELF' }, { key: 'CANCELED' }]);
  });

  it('should return available statuses for order status FORMED', () => {
    const res = service.getAvailableOrderStatuses('FORMED', arr);
    expect(res).toEqual([{ key: 'FORMED' }, { key: 'ADJUSTMENT' }, { key: 'BROUGHT_IT_HIMSELF' }, { key: 'CANCELED' }]);
  });

  it('should return available statuses for order status ADJUSTMENT', () => {
    const res = service.getAvailableOrderStatuses('ADJUSTMENT', arr);
    expect(res).toEqual([
      { key: 'FORMED' },
      { key: 'ADJUSTMENT' },
      { key: 'CONFIRMED' },
      { key: 'BROUGHT_IT_HIMSELF' },
      { key: 'CANCELED' }
    ]);
  });

  it('should return available statuses for order status CONFIRMED', () => {
    const res = service.getAvailableOrderStatuses('CONFIRMED', arr);
    expect(res).toEqual([{ key: 'FORMED' }, { key: 'CONFIRMED' }, { key: 'ON_THE_ROUTE' }, { key: 'CANCELED' }]);
  });

  it('should return available statuses for order status BROUGHT_IT_HIMSELF', () => {
    const res = service.getAvailableOrderStatuses('BROUGHT_IT_HIMSELF', arr);
    expect(res).toEqual([{ key: 'BROUGHT_IT_HIMSELF' }, { key: 'DONE' }, { key: 'CANCELED' }]);
  });

  it('should return available statuses for order status ON_THE_ROUTE', () => {
    const res = service.getAvailableOrderStatuses('ON_THE_ROUTE', arr);
    expect(res).toEqual([{ key: 'ON_THE_ROUTE' }, { key: 'DONE' }, { key: 'NOT_TAKEN_OUT' }, { key: 'CANCELED' }]);
  });

  it('should return available statuses for order status DONE', () => {
    const res = service.getAvailableOrderStatuses('DONE', arr);
    expect(res).toEqual([{ key: 'DONE' }]);
  });

  it('should return available statuses for order status CANCELED', () => {
    const res = service.getAvailableOrderStatuses('CANCELED', arr);
    expect(res).toEqual([{ key: 'CANCELED' }]);
  });
});
