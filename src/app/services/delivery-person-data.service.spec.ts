import { TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { environment } from '../../environments/environment';
import { DeliveryPersonDataService } from './delivery-person-data.service';
import { CustomerDataService } from './customer-data.service';

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
        AngularFireAuth
      ]
    });
    service = TestBed.inject(DeliveryPersonDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});