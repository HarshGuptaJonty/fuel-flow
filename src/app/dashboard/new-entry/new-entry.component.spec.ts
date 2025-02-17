import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from '../../../environments/environment';
import { NewEntryComponent } from './new-entry.component';
import { AccountService } from '../../services/account.service';
import { EntryDataService } from '../../services/entry-data.service';
import { FirebaseService } from '../../services/firebase.service';
import { Database } from '@angular/fire/database';

describe('NewEntryComponent', () => {
  let component: NewEntryComponent;
  let fixture: ComponentFixture<NewEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireDatabaseModule,
        NewEntryComponent
      ],
      providers: [
        AccountService,
        AngularFireAuth,
        EntryDataService,
        FirebaseService,
        Database
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});