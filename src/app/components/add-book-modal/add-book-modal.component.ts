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
import { close, search, keypad, barcode } from 'ionicons/icons';
import { ModalController, Platform } from '@ionic/angular';
import { BuscarLibroPage } from '../../pages/buscar-libro/buscar-libro.page';
import { BuscarPorIsbnPage } from '../../pages/buscar-por-isbn/buscar-por-isbn.page';

// Importar ZXing
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

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
  private isScanning = false;

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

  async escanearCodigo() {
    try {
      this.isScanning = true;

      // Crear modal para el escáner
      const scannerModal = await this.modalCtrl.create({
        component: BarcodeScannerModalComponent,
        cssClass: 'scanner-modal-fullscreen'
      });

      scannerModal.onDidDismiss().then(result => {
        if (result.data?.barcode) {
          console.log('Código escaneado:', result.data.barcode);
          
          // Navegar a la página de búsqueda por ISBN
          this.modalCtrl.dismiss();
          this.router.navigate(['/buscar-por-isbn'], {
            state: { isbn: result.data.barcode }
          });
        }
        this.isScanning = false;
      });

      await scannerModal.present();

    } catch (error) {
      console.error('Error al abrir escáner:', error);
      this.isScanning = false;
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
      await this.escanearCodigo();
    }
  }
}

// Componente modal para el escáner
@Component({
  selector: 'app-barcode-scanner-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Escanear Código</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="scanner-container">
        <video #videoElement autoplay muted playsinline class="scanner-video"></video>
        <div class="scanner-overlay">
          <div class="scanner-frame">
            <div class="scanner-line"></div>
            <div class="corner top-left"></div>
            <div class="corner top-right"></div>
            <div class="corner bottom-left"></div>
            <div class="corner bottom-right"></div>
          </div>
          <p class="scanner-text">Apunta la cámara hacia el código de barras</p>
          <p class="scanner-result" *ngIf="lastResult">✅ {{ lastResult }}</p>
          <p class="scanner-status">{{ statusMessage }}</p>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .scanner-container {
      position: relative;
      width: 100%;
      height: 100%;
      background: #000;
      overflow: hidden;
    }

    .scanner-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .scanner-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10;
    }

    .scanner-frame {
      width: 280px;
      height: 200px;
      position: relative;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 10px;
      overflow: hidden;
    }

    .corner {
      position: absolute;
      width: 25px;
      height: 25px;
      border: 4px solid #4CAF50;
    }

    .corner.top-left {
      top: -4px;
      left: -4px;
      border-right: none;
      border-bottom: none;
    }

    .corner.top-right {
      top: -4px;
      right: -4px;
      border-left: none;
      border-bottom: none;
    }

    .corner.bottom-left {
      bottom: -4px;
      left: -4px;
      border-right: none;
      border-top: none;
    }

    .corner.bottom-right {
      bottom: -4px;
      right: -4px;
      border-left: none;
      border-top: none;
    }

    .scanner-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, transparent, #4CAF50, transparent);
      animation: scanner-animation 2s ease-in-out infinite;
      box-shadow: 0 0 10px #4CAF50;
    }

    @keyframes scanner-animation {
      0%, 100% { transform: translateY(0); opacity: 1; }
      50% { transform: translateY(194px); opacity: 0.8; }
    }

    .scanner-text {
      color: white;
      margin-top: 30px;
      text-align: center;
      font-size: 18px;
      font-weight: 500;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      max-width: 300px;
    }

    .scanner-result {
      color: #4CAF50;
      margin-top: 15px;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      font-size: 20px;
      text-align: center;
      background: rgba(76, 175, 80, 0.2);
      padding: 10px 20px;
      border-radius: 25px;
      border: 1px solid #4CAF50;
    }

    .scanner-status {
      color: #ffc107;
      margin-top: 10px;
      font-size: 14px;
      text-align: center;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
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
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  
  private codeReader = new BrowserMultiFormatReader();
  private isScanning = false;
  lastResult = '';
  statusMessage = 'Iniciando cámara...';

  constructor(private modalCtrl: ModalController) {
    addIcons({ close });
  }

  async ngAfterViewInit() {
    await this.startScanning();
  }

  async startScanning() {
    try {
      this.isScanning = true;
      this.statusMessage = 'Buscando cámaras...';
      
      // Obtener dispositivos de video
      const videoInputDevices = await this.codeReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        this.statusMessage = 'No se encontraron cámaras';
        console.error('No se encontraron cámaras');
        return;
      }

      this.statusMessage = 'Iniciando escáner...';

      // Buscar cámara trasera primero, sino usar la primera disponible
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      
      const selectedDeviceId = backCamera?.deviceId || videoInputDevices[0].deviceId;
      
      console.log('Usando cámara:', videoInputDevices.find(d => d.deviceId === selectedDeviceId)?.label);

      // Iniciar decodificación
      this.codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        this.videoElement.nativeElement,
        (result, err) => {
          if (result) {
            this.lastResult = result.getText();
            this.statusMessage = '¡Código detectado!';
            console.log('Código detectado:', this.lastResult);
            
            // Vibrar si está disponible
            if ('vibrate' in navigator) {
              navigator.vibrate(200);
            }
            
            // Esperar un poco para mostrar el resultado y luego cerrar
            setTimeout(() => {
              this.modalCtrl.dismiss({ barcode: this.lastResult });
            }, 1500);
          }
          if (err && !(err instanceof NotFoundException)) {
            console.log('Error de escaneo:', err);
          }
        }
      );

      this.statusMessage = 'Buscando códigos...';

    } catch (error) {
      this.statusMessage = 'Error al iniciar cámara';
      console.error('Error al iniciar escáner:', error);
    }
  }

  cerrar() {
    this.stopScanning();
    this.modalCtrl.dismiss();
  }

  private stopScanning() {
    if (this.isScanning) {
      try {
        this.codeReader.reset();
      } catch (error) {
        console.log('Error al detener escáner:', error);
      }
      this.isScanning = false;
    }
  }

  ngOnDestroy() {
    this.stopScanning();
  }
}
