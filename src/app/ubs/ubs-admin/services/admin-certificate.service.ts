import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateCertificate } from '../models/ubs-admin.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminCertificateService {
  url = 'https://greencity-ubs.azurewebsites.net/ubs/management';

  constructor(private http: HttpClient) {}

  getTable(column: string, page?: number, search?: string, size?: number, sortingType?: string) {
    return this.http.get<any[]>(
      `${this.url}/getAllCertificates?pageNumber=${page}&pageSize=${size}&search=${search}&sortBy=${column}&sortDirection=${sortingType}`
    );
  }

  createCertificate(certificate: CreateCertificate) {
    return this.http.post(`${this.url}/addCertificate`, certificate);
  }
}
