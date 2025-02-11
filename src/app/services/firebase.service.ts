import { Injectable } from '@angular/core';
import { child, Database, get, ref, set } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private db: Database
  ) { }

  async getData(path: string) {
    const dbRef = ref(this.db);
    try {
      const snapshot = await get(child(dbRef, path));
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        console.log("No data available");
        //TODO: left bottom notification
        return null;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      //TODO: left bottom notification
      return null;
    }
  }

  setData(path: string, data: any) {
    return set(ref(this.db, path), data);
  }
}
