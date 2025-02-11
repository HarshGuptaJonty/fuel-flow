import { Injectable } from '@angular/core';
import { child, Database, get, ref } from '@angular/fire/database';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private db: Database,
    private database: AngularFireDatabase
  ) { }

  async getData(path: string) {
    const dbRef = ref(this.db);
    try {
      const snapshot = await get(child(dbRef, path));
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        console.log("No data available");
        return null;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }

  setData(path: string, key: string, data: any):any {
    this.database.list(path).set(key, data).then(() => {
      return {
        success: true,
        error: null
      };
    }).catch((error) => {
      return {
        success: false,
        error: error
      };
    })
  }
}
