import { take } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommentsService } from '../../services/comments.service';
import { ProfileService } from '@global-user/components/profile/profile-service/profile.service';

@Component({
  selector: 'app-add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss']
})
export class AddCommentComponent implements OnInit {
  @Output() public updateList = new EventEmitter();
  @Input() public commentId: number;
  public userInfo;
  public avatarImage: string;
  public firstName: string;
  public addCommentForm: FormGroup = this.fb.group({
    content: ['', [Validators.required, Validators.maxLength(8000)]]
  });
  public replyMaxLength = 8000;

  constructor(private commentsService: CommentsService, private fb: FormBuilder, private profileService: ProfileService) {}

  ngOnInit() {
    this.getUserInfo();
  }

  public getUserInfo(): void {
    this.profileService.getUserInfo().subscribe((item) => {
      this.firstName = item.name;
      this.avatarImage = item.profilePicturePath;
    });
  }

  public onSubmit(): void {
    this.commentsService
      .addComment(this.addCommentForm, this.commentId)
      .pipe(take(1))
      .subscribe(() => {
        this.updateList.emit();
        this.addCommentForm.reset();
      });
  }
}
