import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { SubmitEmailComponent } from './submit-email.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('SubmitEmailComponent', () => {
  let component: SubmitEmailComponent;
  let fixture: ComponentFixture<SubmitEmailComponent>;
  class MatDialogRefMock {
    close() {}
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SubmitEmailComponent],
      imports: [HttpClientTestingModule, MatDialogModule, TranslateModule.forRoot()],
      providers: [{ provide: MatDialogRef, useClass: MatDialogRefMock }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
