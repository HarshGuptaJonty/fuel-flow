import { TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from '../../environments/environment';
import { EntryDetailModelService } from './entry-detail-model.service';
import { AdminDataService } from './admin-data.service';
import { Database } from '@angular/fire/database';

describe('EntryDetailModelService', () => {
  let service: EntryDetailModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireDatabaseModule
      ],
      providers: [
        AngularFireAuth,
        EntryDetailModelService,
        AdminDataService,
        { provide: Database, useValue: {} }
      ]
    });
    service = TestBed.inject(EntryDetailModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});