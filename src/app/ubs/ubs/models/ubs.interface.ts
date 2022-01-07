export interface Bag {
  id: number;
  name?: string;
  capacity?: number;
  price?: number;
  quantity?: number;
  code?: string;
}

export interface OrderBag {
  amount: number;
  id: number;
}

export interface OrderDetails {
  bags?: Bag[];
  points: number;
  pointsToUse?: number;
  certificates?: any;
  additionalOrders?: any;
  orderComment?: string;
  certificatesSum?: number;
  pointsSum?: number;
  total?: number;
  finalSum?: number;
  minAmountOfBigBags?: number;
}

export interface OrderDetailsNotification {
  bags: Bag[];
  points: number;
  pointsToUse?: number;
  certificates?: any;
  additionalOrders?: any;
  orderComment?: string;
  certificatesSum?: number;
  pointsSum?: number;
  total?: number;
  finalSum?: number;
  minAmountOfBigBags?: number;
}

export interface OrderDetailsNotification {
  bags: Bag[];
  addressComment?: string;
  orderBonusDiscount?: number;
  orderCertificateTotalDiscount?: number;
  orderFullPrice?: number;
  orderDiscountedPrice?: number;
  amountOfBagsOrdered?: number;
  recipientName?: string;
  recipientSurname?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  addressCity?: string;
  addressStreet?: string;
  addressDistrict?: string;
  addressRegion?: string;
}

export interface FinalOrder {
  bags: Bag[];
  pointsToUse?: number;
  cerfiticates?: any;
  additionalOrders?: any;
  orderComment?: string;
  personalData?: PersonalData;
  points?: number;
}

export interface ICertificate {
  certificatePoints: number;
  certificateStatus: string;
  certificateDate?: string;
}

export interface PersonalData {
  id?: number;
  ubsUserId?: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  anotherClientFirstName?: string;
  anotherClientLastName?: string;
  anotherClientEmail?: string;
  anotherClientPhoneNumber?: string;
  addressComment: string;
  city: string;
  district: string;
  street?: string;
  region?: string;
  houseCorpus?: string;
  entranceNumber?: string;
  houseNumber?: string;
  longitude?: number;
  latitude?: number;
}

export interface Address {
  actual: boolean;
  id: number;
  region: string;
  city: string;
  district: string;
  street: string;
  houseCorpus: string;
  entranceNumber: string;
  houseNumber: string;
  addressComment?: string;
  coordinates: {
    latitude?: number;
    longitude?: number;
  };
}

export interface Locations {
  id: number;
  name: string;
  languageCode: string;
}

export interface CourierTranslationDtos {
  languageCode: string;
  limitDescription: string;
  name: string;
}
export interface CourierDtos {
  courierId: number;
  courierStatus: string;
  courierTranslationDtos: CourierTranslationDtos[];
}

export interface LocationTranslation {
  region: number;
  locationName: string;
  languageCode: string;
}

export interface LocationsDtos {
  locationId: number;
  locationStatus: string;
  locationTranslationDtoList: LocationTranslation[];
}
export interface CourierLocations {
  courierDtos: CourierDtos[];
  courierLimit: string;
  courierLocationId: number;
  locationsDtos: LocationsDtos[];
  maxAmountOfBigBags: number;
  maxPriceOfOrder: number;
  minAmountOfBigBags: number;
  minPriceOfOrder: number;
}
