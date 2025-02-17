import { TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from '../../environments/environment';
import { AdminDataService } from './admin-data.service';

describe('AdminDataService', () => {
  let service: AdminDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireDatabaseModule
      ],
      providers: [
        AngularFireAuth,
        AdminDataService
      ]
    });
    service = TestBed.inject(AdminDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});