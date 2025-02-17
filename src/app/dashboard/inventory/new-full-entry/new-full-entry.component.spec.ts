import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from '../../../../environments/environment';
import { NewFullEntryComponent } from './new-full-entry.component';
import { AccountService } from '../../../services/account.service';

describe('NewFullEntryComponent', () => {
  let component: NewFullEntryComponent;
  let fixture: ComponentFixture<NewFullEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireDatabaseModule,
        NewFullEntryComponent
      ],
      providers: [
        AngularFireAuth,
        AccountService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewFullEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});