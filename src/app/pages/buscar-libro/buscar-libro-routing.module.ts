import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BuscarLibroPage } from './buscar-libro.page';

const routes: Routes = [
  {
    path: '',
    component: BuscarLibroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BuscarLibroPageRoutingModule {}
