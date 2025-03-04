import { RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import { NgModule } from "@angular/core";
import { CustomerComponent } from "./customer/customer.component";
import { InventoryComponent } from "./inventory/inventory.component";
import { WarehouseComponent } from "./warehouse/warehouse.component";
import { DeliveryPersonComponent } from "./delivery-person/delivery-person.component";
import { ProfileComponent } from "../profile/profile.component";

const routes: Routes = [
    {
        path: '',
        component: DashboardComponent,
        children: [
            { path: 'customers', component: CustomerComponent },
            { path: 'inventory', component: InventoryComponent },
            { path: 'warehouse', component: WarehouseComponent },
            { path: 'delivery', component: DeliveryPersonComponent },
            { path: 'profile', component: ProfileComponent },
            { path: '', redirectTo: 'customers', pathMatch: 'full' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule { }