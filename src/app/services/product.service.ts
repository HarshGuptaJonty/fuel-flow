import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, Subject } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { NotificationService } from './notification.service';
import { Product } from '../../assets/models/Product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private productList = new BehaviorSubject<any>(null);
  productList$ = this.productList.asObservable();

  isDataChanged = new Subject<any>();

  constructor(
    private afAuth: AngularFireAuth,
    private firebaseService: FirebaseService,
    private notificationService: NotificationService
  ) {
    this.initialize();
  }

  private async initialize(showNotification = false) {
    const data = await this.firebaseService.getData('productList');
    if (Object.keys(data).length > 0) {
      this.productList.next(data);
      this.isDataChanged.next(true);
    } else {
      this.productList.next(null);
      this.isDataChanged.next(false);

      if (showNotification) {
        this.notificationService.showNotification({
          heading: 'No product to show!',
          duration: 5000,
          leftBarColor: this.notificationService.color.red
        });
      }
    }
  }

  hardRefresh() {
    this.initialize(true);
  }

  getProductList() {
    return this.productList.value;
  }

  addNewProduct(product: Product, isEditing = false) {
    this.firebaseService.setData(`productList/${product.data.productId}`, product).then(() => {
      const objects = this.productList.getValue() || {};
      objects[product.data.productId] = product;
      this.productList.next(objects);
      this.isDataChanged.next(true);

      this.notificationService.showNotification({
        heading: isEditing ? 'Product edited.' : 'New product added.',
        message: 'Data saved successfully.',
        duration: 5000,
        leftBarColor: this.notificationService.color?.green
      });
    }).catch(() => {
      this.isDataChanged.next(false);
      this.notificationService.somethingWentWrong('113');
    });
  }

  deleteProduct(product: Product) {
    this.firebaseService.setData(`productList/${product.data.productId}`, null).then(() => {
      const objects = this.productList.getValue() || {};
      delete objects[product.data.productId];
      this.productList.next(objects);
      this.isDataChanged.next(true);

      this.notificationService.showNotification({
        heading: 'Product deleted!',
        message: 'Data erased successfully.',
        duration: 5000,
        leftBarColor: this.notificationService.color?.green
      });
    }).catch(() => {
      this.isDataChanged.next(false);
      this.notificationService.somethingWentWrong('114');
    });
  }
}
