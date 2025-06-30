import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';


const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.page').then(m => m.RegistroPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then( m => m.HomePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'biblioteca',
    loadComponent: () => import('./pages/biblioteca/biblioteca.page').then( m => m.BibliotecaPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'progreso',
    loadComponent: () => import('./pages/progreso/progreso.page').then( m => m.ProgresoPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'buscar-libro',
    loadComponent: () => import('./pages/buscar-libro/buscar-libro.page').then( m => m.BuscarLibroPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'buscar-por-isbn',
    loadComponent: () => import('./pages/buscar-por-isbn/buscar-por-isbn.page').then( m => m.BuscarPorIsbnPage),
    canActivate: [AuthGuard]
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
