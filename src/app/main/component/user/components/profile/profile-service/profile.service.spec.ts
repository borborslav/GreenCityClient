import { Language } from './../../../../../i18n/Language';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  const backUserLink = 'https://greencity-user.azurewebsites.net/';
  const backLink = 'https://greencity.azurewebsites.net/';
  let profileService: ProfileService;
  let httpMock: HttpTestingController;

  let localStorageServiceMock: LocalStorageService;
  localStorageServiceMock = jasmine.createSpyObj('LocalStorageService', ['userIdBehaviourSubject']);
  localStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject(1111);

  let languageServiceMock: LanguageService;
  languageServiceMock = jasmine.createSpyObj('LanguageService', ['getCurrentLanguage']);
  languageServiceMock.getCurrentLanguage = () => 'en' as Language;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProfileService,
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: LanguageService, useValue: languageServiceMock }
      ]
    });
    profileService = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    const service: ProfileService = TestBed.inject(ProfileService);
    expect(service).toBeTruthy();
  });

  it('should set user id', () => {
    let userId = null;
    // @ts-ignore
    profileService.localStorageService.userIdBehaviourSubject.subscribe((id) => (userId = id));
    expect(userId).toBe(1111);
  });

  describe('test for method which get facts for today', () => {
    it('should return fact of the day', () => {
      const fact = { id: 1, content: 'Great day!' };
      profileService.getFactsOfTheDay().subscribe((info) => {
        expect(info.content).toBe('Great day!');
      });

      const req = httpMock.expectOne(`${backLink}factoftheday/?lang=en`);
      expect(req.request.method).toBe('GET');
      req.flush(fact);
    });
  });

  describe('test for method which get info about user', () => {
    it('should return user info', () => {
      const userInfo = {
        city: 'Lviv',
        firstName: 'Anton',
        userCredo: 'Eco',
        profilePicturePath: 'somepath',
        rating: 1999,
        showEcoPlace: true,
        showLocation: false,
        showShoppingList: true,
        socialNetworks: []
      };

      profileService.getUserInfo().subscribe((info) => {
        expect(info.rating).toBe(1999);
      });

      const req = httpMock.expectOne(`${backUserLink}user/1111/profile/`);
      expect(req.request.method).toBe('GET');
      req.flush(userInfo);
    });
  });

  describe('test for method which get statistics about user profile', () => {
    it('should return user profile statistics', () => {
      const stat = {
        amountHabitsInProgress: 2,
        amountHabitsAcquired: 1,
        amountWrittenTipsAndTrick: 0,
        amountPublishedNews: 7
      };

      profileService.getUserProfileStatistics().subscribe((info) => {
        expect(info.amountHabitsAcquired).toBe(1);
      });

      const req = httpMock.expectOne(`${backUserLink}user/1111/profileStatistics/`);
      expect(req.request.method).toBe('GET');
      req.flush(stat);
    });
  });

  describe('test for method which get user eco-places', () => {
    it('should return eco-places', () => {
      const places = [
        {
          placeId: 1,
          name: 'string'
        },
        {
          placeId: 2,
          name: 'string2'
        }
      ];

      profileService.getEcoPlaces().subscribe((info) => {
        expect(info.length).toBe(2);
      });

      const req = httpMock.expectOne(`${backLink}favorite_place/`);
      expect(req.request.method).toBe('GET');
      req.flush(places);
    });
  });

  describe('test for method which get six user friends for dashboard', () => {
    it('should return six user friends', () => {
      const userFriends = {
        amountOfFriends: 30,
        pagedFriends: {
          currentPage: 1,
          page: [],
          totalElements: 6,
          totalPages: 1
        }
      };

      profileService.getUserFriends().subscribe((info) => {
        expect(info.pagedFriends.totalElements).toBe(6);
      });

      const req = httpMock.expectOne(`${backUserLink}user/1111/sixUserFriends/`);
      expect(req.request.method).toBe('GET');
      req.flush(userFriends);
    });
  });
});
