import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, search, keypad, barcode, camera } from 'ionicons/icons';
import { ModalController, Platform } from '@ionic/angular';
import { BuscarLibroPage } from '../../pages/buscar-libro/buscar-libro.page';
import { BuscarPorIsbnPage } from '../../pages/buscar-por-isbn/buscar-por-isbn.page';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-add-book-modal',
  templateUrl: './add-book-modal.component.html',
  styleUrls: ['./add-book-modal.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent
  ],
})
export class AddBookModalComponent {
  foto: string | null = null; 

  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private platform: Platform
  ) {
    addIcons({ close, search, keypad, barcode });
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }

 async tomarFotoConCamara() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      this.foto = image.webPath || null;
      console.log('Foto tomada:', this.foto);

    } catch (error) {
      console.error('Error al tomar foto:', error);
    }
  }


  async seleccionar(opcion: string) {
    if (opcion === 'busqueda') {
      const modal = await this.modalCtrl.create({
        component: BuscarLibroPage
      });

      modal.onDidDismiss().then(result => {
        if (result.data?.libro) {
          this.modalCtrl.dismiss({ libro: result.data.libro });
        }
      });

      await modal.present();

    } else if (opcion === 'isbn') {
      const modal = await this.modalCtrl.create({
        component: BuscarPorIsbnPage
      });

      modal.onDidDismiss().then(result => {
        if (result.data?.libro) {
          this.modalCtrl.dismiss({ libro: result.data.libro });
        }
      });

      await modal.present();

    } else if (opcion === 'codigo-barras') {
      await this.tomarFotoConCamara();
    }
  }
}

@Component({
  selector: 'app-barcode-scanner-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Cámara</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="camera-container">
        <ion-button expand="full" (click)="tomarFoto()">
          <ion-icon slot="start" name="camera"></ion-icon>
          Tomar Foto
        </ion-button>

        <div class="preview" *ngIf="foto">
          <img [src]="foto" alt="Foto tomada" />
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .camera-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 20px;
    }
    .preview {
      margin-top: 20px;
      width: 100%;
      max-width: 300px;
    }
    .preview img {
      width: 100%;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent
  ]
})
export class BarcodeScannerModalComponent {
  foto: string | undefined;

  constructor(private modalCtrl: ModalController) {
    addIcons({ close, camera });
  }

  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      this.foto = image.webPath || '';
      console.log('Foto tomada:', this.foto);
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}

