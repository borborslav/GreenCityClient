import { Component, Input, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
})
export class ErrorComponent implements OnChanges {
  @Input() public controlName: string;
  @Input() public formElement: FormControl;
  @Input() public emailFieldValue: string;
  @Input() public nameFieldValue: string;
  @Input() public passwordFieldValue: string;
  @Input() public passwordConfirmFieldValue: string;
  public errorMessage = '';

  private getErrorMsg = {
    required: () => {
      if (this.controlName === 'email') {
        return 'user.auth.sign-in.email-is-required';
      } else if (this.controlName === 'firstName') {
        return 'user.auth.sign-up.first-name-is-required';
      } else {
        return 'user.auth.sign-in.password-is-required';
      }
    },
    email: () => (this.emailFieldValue ? 'user.auth.sign-in.this-is-not-email' : 'user.auth.sign-in.email-is-required'),
    passwordMismatch: () => 'user.auth.sign-up.password-match',
    minlength: () => 'user.auth.sign-in.password-must-be-at-least-8-characters-long',
    symbolInvalid: () =>
      this.controlName === 'password' ? 'user.auth.sign-up.password-symbols-error' : 'user.auth.sign-up.user-name-size',
  };

  ngOnChanges() {
    this.getType();
  }

  private getType() {
    Object.keys(this.formElement.errors).forEach((error) => {
      this.errorMessage = this.getErrorMsg[error]();
      return this.errorMessage;
    });
  }
}
