import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthServiceService } from 'src/app/services/auth-service.service';

// Angular Material
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    RouterModule
  ]
})
export class RegistroPage {
  email = '';
  username = '';
  password = '';
  nivel = '';
  fechaNacimiento: Date | null = null;
  fechaMaxima = new Date(); // Fecha actual como máximo

  constructor(
    private alertCtrl: AlertController,
    private router: Router,
    private authService: AuthServiceService
  ) {}

  private validarCampos(): boolean {
    if (!this.email.trim()) {
      this.mostrarError('El campo Correo Electrónico es obligatorio');
      return false;
    }
    if (!this.username.trim()) {
      this.mostrarError('El campo Nombre de usuario es obligatorio');
      return false;
    }
    if (!this.password.trim() || this.password.length < 6) {
      this.mostrarError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (!this.nivel.trim()) {
      this.mostrarError('El campo Nivel de Lectura es obligatorio');
      return false;
    }
    if (!this.fechaNacimiento) {
      this.mostrarError('El campo Fecha de nacimiento es obligatorio');
      return false;
    }
    const hoy = new Date();
    const diezAniosAtras = new Date(hoy.getFullYear() - 10, hoy.getMonth(), hoy.getDate());
    if (this.fechaNacimiento > diezAniosAtras) {
      this.mostrarError('Debes tener al menos 10 años para registrarte');
      return false;
    }
    return true;
  }

  private async mostrarError(mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error de validación',
      message: mensaje,
      buttons: ['OK'],
      cssClass: 'alert-error'
    });
    await alert.present();
  }

  async registrar() {
    console.log('DB isReady:', this.authService.isReady);
    if (!this.validarCampos()) return;

    const registrado = await this.authService.registerUser(
      this.email,
      this.username,
      this.password,
      this.nivel,
      this.fechaNacimiento?.toISOString().split('T')[0] || ''
    );

    if (!registrado) {
      this.mostrarError('Este usuario ya está registrado');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: '¡Registro exitoso!',
      message: 'Tu cuenta fue creada exitosamente.',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.router.navigate(['/login']);
        }
      }],
      cssClass: 'alert-success'
    });
    await alert.present();
  }

  async volverAlLogin() {
    await this.router.navigateByUrl('/login', {
      replaceUrl: true,
      skipLocationChange: false
    });
  }
}

