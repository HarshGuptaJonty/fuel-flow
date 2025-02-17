import { TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from '../../environments/environment';
import { EntryDataService } from './entry-data.service';
import { Database } from '@angular/fire/database';

describe('EntryDataService', () => {
  let service: EntryDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireDatabaseModule
      ],
      providers: [
        AngularFireAuth,
        EntryDataService,
        Database
      ]
    });
    service = TestBed.inject(EntryDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});