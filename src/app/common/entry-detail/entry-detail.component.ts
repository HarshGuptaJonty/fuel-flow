import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { EntryDetailModelService } from '../../services/entry-detail-model.service';

@Component({
  selector: 'app-entry-detail',
  imports: [
    CommonModule,
    MatButtonModule
  ],
  templateUrl: './entry-detail.component.html',
  styleUrl: './entry-detail.component.scss'
})
export class EntryDetailComponent {

  constructor(
    public entryDetailModelService: EntryDetailModelService
  ) { }

  onClose() {
    this.entryDetailModelService.hideModel();
  }
}
