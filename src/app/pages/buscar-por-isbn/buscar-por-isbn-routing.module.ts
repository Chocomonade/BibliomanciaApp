import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BuscarPorIsbnPage } from './buscar-por-isbn.page';

const routes: Routes = [
  {
    path: '',
    component: BuscarPorIsbnPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BuscarPorIsbnPageRoutingModule {}
