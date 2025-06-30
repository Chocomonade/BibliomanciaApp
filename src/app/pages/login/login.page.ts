import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { AuthServiceService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonicModule, FormsModule, CommonModule]
})
export class LoginPage implements OnInit {
  username: string = '';
  password: string = '';

  constructor(private navCtrl: NavController,
    private alertController: AlertController, 
    private authService: AuthServiceService) {}


  ngOnInit() {  
  }

  async mostrarAlerta (mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  //Función para validad email
  validarEmail(email:string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async login() {
    if (!this.username) {
      this.mostrarAlerta('El campo usuario no puede estar vacío.');
      return;
    }

  //Verificar que la contraseña no esté vacía
  if (!this.password) {
    this.mostrarAlerta('El campo contraseña no puede estar vacío.');
    return;
  }

  //Validar credenciales con el servicio de autenticación
  const isAunthenticated = await this.authService.loginUser(this.username, this.password);
  if (isAunthenticated) {
    localStorage.setItem('username', this.username);

    this.navCtrl.navigateForward(['/home'], {
      queryParams: {
        username: this.username
      }
    });
  } else {
    this.mostrarAlerta('Usuario o contraseña incorrectos.')
    }
  }

  goToRegistro() {
  this.navCtrl.navigateForward('/registro');
}
}

