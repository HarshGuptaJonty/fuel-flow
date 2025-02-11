import { RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import { NgModule } from "@angular/core";
import { CustomerComponent } from "./customer/customer.component";
import { InventoryComponent } from "./inventory/inventory.component";
import { SettingComponent } from "./setting/setting.component";

const routes: Routes = [
    {
        path: '',
        component: DashboardComponent,
        children: [
            { path: 'customers', component: CustomerComponent },
            { path: 'inventory', component: InventoryComponent },
            { path: 'setting', component: SettingComponent },
            { path: '', redirectTo: 'customers', pathMatch: 'full' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule { }