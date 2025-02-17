import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from '../../../environments/environment';
import { EntryDetailComponent } from './entry-detail.component';
import { EntryDetailModelService } from '../../services/entry-detail-model.service';
import { AdminDataService } from '../../services/admin-data.service';
import { Database } from '@angular/fire/database';

describe('EntryDetailComponent', () => {
  let component: EntryDetailComponent;
  let fixture: ComponentFixture<EntryDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireDatabaseModule,
        EntryDetailComponent
      ],
      providers: [
        AngularFireAuth,
        EntryDetailModelService,
        AdminDataService,
        Database
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});