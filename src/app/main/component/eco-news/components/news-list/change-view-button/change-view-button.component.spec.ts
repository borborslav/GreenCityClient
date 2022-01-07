import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeViewButtonComponent } from './change-view-button.component';

describe('ChangeViewButtonComponent', () => {
  let component: ChangeViewButtonComponent;
  let fixture: ComponentFixture<ChangeViewButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChangeViewButtonComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeViewButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('test main methods', () => {
    it('should set value to sessionStorage', () => {
      const store = {};
      const spy = spyOn(sessionStorage, 'setItem').and.callFake((key: string, value: string): string => {
        return (store[key] = value);
      });
      // @ts-ignore
      component.setSessionStorageView();
      expect(spy('viewGallery', 'true')).toBe('true');
    });

    it('should get value from sessionStorage', () => {
      const store = { viewGallery: 'true' };
      const spy = spyOn(sessionStorage, 'getItem').and.callFake((key) => {
        return store[key];
      });
      // @ts-ignore
      component.getSessionStorageView();
      expect(spy('viewGallery')).toBe('true');
    });

    it('should emit gallery view', () => {
      let result = null;
      const gallery = true;
      component.view.subscribe((value) => (result = value));
      // @ts-ignore
      component.changeGalleryViewEmit(gallery);
      expect(result).toBeTruthy();
    });

    it('should change view to gallery-view', () => {
      // @ts-ignore
      const spy = spyOn(component, 'setSessionStorageView');
      component.changeGalleryView();
      expect(component.gallery).toBeTruthy();
      expect(spy).toHaveBeenCalled();
    });

    it('should change view to list-view', () => {
      // @ts-ignore
      const spy = spyOn(component, 'setSessionStorageView');
      component.changeListView();
      expect(component.gallery).toBeFalsy();
      expect(spy).toHaveBeenCalled();
    });
  });
});
