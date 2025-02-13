import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EntryTransaction } from '../../assets/models/EntryTransaction';

@Injectable({
  providedIn: 'root'
})
export class EntryDetailModelService {

  private entryData = new BehaviorSubject<any>(null);
  entryData$ = this.entryData.asObservable();

  showModel(data: EntryTransaction) {
    this.entryData.next(data);
  }

  hideModel(){
    this.entryData.next(null);
  }
}
