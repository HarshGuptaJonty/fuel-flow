import { TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { environment } from '../../environments/environment';
import { DeliveryPersonDataService } from './delivery-person-data.service';
import { CustomerDataService } from './customer-data.service';
import { Database } from '@angular/fire/database';

describe('DeliveryPersonDataService', () => {
  let service: DeliveryPersonDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp(environment.firebaseConfig)
      ],
      providers: [
        DeliveryPersonDataService,
        CustomerDataService,
        AngularFireAuth,
        { provide: Database, useValue: {} }
      ]
    });
    service = TestBed.inject(DeliveryPersonDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});