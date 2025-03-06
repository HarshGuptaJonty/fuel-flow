import { Component, OnInit } from '@angular/core';
import { Product } from '../../../assets/models/Product';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AccountService } from '../../services/account.service';
import { formatDateAndTime, generateDateTimeKey, generateRandomString } from '../../shared/commonFunctions';
import { ProductService } from '../../services/product.service';
import { ConfirmationModelService } from '../../services/confirmation-model.service';
import { NotificationService } from '../../services/notification.service';
import { AdminDataService } from '../../services/admin-data.service';
import { ActivatedRoute } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-warehouse',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule
  ],
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.scss'
})
export class WarehouseComponent implements OnInit {

  addNewProduct = false;
  isEditingProduct = false;
  isProductReturnable = true;
  errorMessage?: string;
  selectedProduct?: Product;
  queryProductId?: string;
  productList: Product[] = [];

  productForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    rate: new FormControl('', [Validators.required]),
    extraNote: new FormControl('')
  })

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private productService: ProductService,
    private confirmationModelService: ConfirmationModelService,
    private notificationService: NotificationService,
    private adminDataService: AdminDataService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.queryProductId = params['productId'];
    });

    this.refreshEntryData();

    this.productService.isDataChanged?.subscribe(flag => {
      if (flag)
        this.refreshEntryData();
    })
  }

  refreshEntryData() {
    this.addNewProduct = false;
    this.selectedProduct = undefined;

    let objects = this.productService.getProductList() || {};
    this.productList = Object.values(objects);

    if (this.queryProductId && this.productList.length > 0) {
      this.selectedProduct = objects?.[this.queryProductId];
      this.queryProductId = undefined;
    }
  }

  onAddNewProduct() {
    this.addNewProduct = !this.addNewProduct;
    if (this.addNewProduct) {
      this.isEditingProduct = false;
      this.productForm.reset();
    }
    this.selectedProduct = undefined;
  }

  onSaveClick() {
    const createdBy = this.selectedProduct?.others?.createdBy || this.accountService.getUserId();
    const createdTime = this.selectedProduct?.others?.createdTime || Date.now();
    const productId = this.selectedProduct?.data.productId || generateDateTimeKey() + '_' + generateRandomString(5);

    const productData = this.productForm.value;
    productData.productId = productId;
    productData.productReturnable = this.isProductReturnable;

    const newProduct = {
      data: productData,
      others: {
        createdBy: createdBy,
        createdTime: createdTime,
        editedBy: this.accountService.getUserId(),
        editedTime: Date.now(),
      }
    }

    this.productService.addNewProduct(newProduct, this.isEditingProduct);
    this.addNewProduct = false;
  }

  onCancelClick() {
    this.addNewProduct = false;
  }

  onEditClick() {
    this.confirmationModelService.showModel({
      heading: 'Edit product?',
      message: 'You are trying to edit a product, it wont effect any entry made in past, once edited, cannot be undone, are you sure?',
      leftButton: {
        text: 'Confirm',
        customClass: this.confirmationModelService.CUSTOM_CLASS?.GREY_RED,
      }, rightButton: {
        text: 'Cancel',
        customClass: this.confirmationModelService.CUSTOM_CLASS?.GREY,
      }
    }).subscribe(result => {
      if (result === 'left') {
        this.confirmationModelService.hideModel();
        if (this.selectedProduct) {
          this.isEditingProduct = true;
          this.addNewProduct = true;
          this.isProductReturnable = this.selectedProduct?.data.productReturnable || false;

          this.productForm = new FormGroup({
            name: new FormControl(this.selectedProduct?.data.name, [Validators.required]),
            rate: new FormControl(this.selectedProduct?.data.rate, [Validators.required]),
            extraNote: new FormControl(this.selectedProduct?.data.extraNote || '')
          })
        } else
          this.notificationService.somethingWentWrong('115');
      } else
        this.confirmationModelService.hideModel();
    });
  }

  onDeleteClick() {
    this.confirmationModelService.showModel({
      heading: 'Delete product?',
      message: 'You are trying to delete a product, it wont effect any entry made in past, once deleted, cannot be retrived, are you sure?',
      leftButton: {
        text: 'Confirm',
        customClass: this.confirmationModelService.CUSTOM_CLASS?.GREY_RED,
      }, rightButton: {
        text: 'Cancel',
        customClass: this.confirmationModelService.CUSTOM_CLASS?.GREY,
      }
    }).subscribe(result => {
      if (result === 'left') {
        this.confirmationModelService.hideModel();
        if (this.selectedProduct)
          this.productService.deleteProduct(this.selectedProduct);
        else
          this.notificationService.somethingWentWrong('114');
      } else
        this.confirmationModelService.hideModel();
    });
  }

  createByName(userId?: string) {
    return this.adminDataService.getAdminName(userId);
  }

  createdTime(timestamp?: number) {
    return formatDateAndTime(timestamp);
  }
}
