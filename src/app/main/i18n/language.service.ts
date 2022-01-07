import { LocalStorageService } from './../service/localstorage/local-storage.service';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language } from './Language';
import { LanguageId } from '../interface/language-id';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private defaultLanguage = Language.EN;
  private monthMap = new Map<Language, string[]>();
  private langMap = new Map();
  public synqLanguageArr: LanguageId[] = [
    { id: 1, code: 'ua' },
    { id: 2, code: 'en' },
    { id: 3, code: 'ru' }
  ];

  constructor(private translate: TranslateService, private localStorageService: LocalStorageService) {
    this.langMap.set(Language.EN, ['en']);
    this.langMap.set(Language.UA, ['ua']);
    this.langMap.set(Language.RU, ['ru']);

    this.monthMap.set(Language.UA, [
      'січня',
      'лютого',
      'березня',
      'квітня',
      'травня',
      'червня',
      'липня',
      'серпня',
      'вересня',
      'жовтня',
      'листопада',
      'грудня'
    ]);
    this.monthMap.set(Language.EN, [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december'
    ]);
    this.monthMap.set(Language.RU, [
      'января',
      'февраля',
      'марта',
      'апреля',
      'мая',
      'июня',
      'июля',
      'августа',
      'сентября',
      'октября',
      'ноября',
      'декабря'
    ]);
  }

  public setDefaultLanguage() {
    if (this.localStorageService.getCurrentLanguage() !== null) {
      this.translate.setDefaultLang(this.localStorageService.getCurrentLanguage());
    } else {
      this.translate.setDefaultLang(this.getLanguageByString(navigator.language));
      this.localStorageService.setCurrentLanguage(this.getLanguageByString(navigator.language));
    }
  }

  public getCurrentLanguage() {
    return this.localStorageService.getCurrentLanguage();
  }

  private getLanguageByString(languageString: string) {
    for (const key of this.langMap.keys()) {
      if (this.langMap.get(key).indexOf(languageString) !== -1) {
        return key;
      }
    }

    return this.defaultLanguage;
  }

  public getLocalizedMonth(month: number) {
    return this.monthMap.get(this.getCurrentLanguage())[month];
  }

  public changeCurrentLanguage(language: Language) {
    this.localStorageService.setCurrentLanguage(language);
    this.translate.setDefaultLang(language);
  }

  public getLanguageId(language: Language) {
    return this.synqLanguageArr.find((res) => res.code === language).id;
  }
}
