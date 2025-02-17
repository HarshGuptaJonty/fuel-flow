import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from '../../../environments/environment';
import { EntryDataTableComponent } from './entry-data-table.component';
import { Database } from '@angular/fire/database';

describe('EntryDataTableComponent', () => {
  let component: EntryDataTableComponent;
  let fixture: ComponentFixture<EntryDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireDatabaseModule,
        EntryDataTableComponent
      ],
      providers: [
        AngularFireAuth,
        Database
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntryDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});