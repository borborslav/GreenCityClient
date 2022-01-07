import { EcoNewsModel } from '@eco-news-models/eco-news-model';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { NewsListGalleryViewComponent } from './news-list-gallery-view.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('NewsListGalleryViewComponent', () => {
  let component: NewsListGalleryViewComponent;
  let fixture: ComponentFixture<NewsListGalleryViewComponent>;
  const defaultImagePath =
    'https://csb10032000a548f571.blob.core.windows.net/allfiles/90370622-3311-4ff1-9462-20cc98a64d1ddefault_image.jpg';
  const ecoNewsMock: EcoNewsModel = {
    id: 1,
    imagePath: defaultImagePath,
    title: 'string',
    text: 'string',
    author: {
      id: 1,
      name: 'string'
    },
    tags: [{ id: 1, name: 'test' }],

    creationDate: '11',
    likes: 0,
    countComments: 2
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [NewsListGalleryViewComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsListGalleryViewComponent);
    component = fixture.componentInstance;
    component.ecoNewsModel = ecoNewsMock;
    component.profileIcons.newsDefaultPictureList = defaultImagePath;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get default image', () => {
    ecoNewsMock.imagePath = ' ';
    component.ecoNewsModel = ecoNewsMock;
    component.checkNewsImage();
    expect(component.newsImage).toBe(defaultImagePath);
  });
});
