import { Component, OnInit, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, AnimationController, ModalController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AddBookModalComponent } from '../../components/add-book-modal/add-book-modal.component';
import { register } from 'swiper/element/bundle';
import { BooksService } from '../../services/books.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    AddBookModalComponent
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePage implements OnInit, AfterViewInit {
  username = '';
  librosActuales: any[] = [];
  librosPorLeer: any[] = [];

  estadisticas = {
    librosTerminados: 0,
    tiempoLectura: '0h'
  };

  constructor(
    private router: Router,
    private alertController: AlertController,
    private animationCtrl: AnimationController,
    private http: HttpClient,
    private modalCtrl: ModalController,
    private booksService: BooksService
  ) {
    register();
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['usuario']) {
      this.username = nav.extras.state['usuario'];
    }
  }

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['usuario']) {
      this.username = nav.extras.state['usuario'];
    } else {
      this.username = localStorage.getItem('username') || '';
    }

    this.booksService.libros$.subscribe(libros => {
      // Solo los libros que estén en estado 'leyendo'
      this.librosActuales = libros.filter(libro => libro.estado === 'leyendo');
      this.actualizarEstadisticas();
    });
    this.booksService.loadBooks();

    const pendientes = localStorage.getItem('librosPorLeer');
    this.librosPorLeer = pendientes ? JSON.parse(pendientes) : [];
  }

  ionViewWillEnter() {
    this.booksService.loadBooks();
  }

  ngAfterViewInit() {
    const libroActual = document.querySelector('.libro-actual-card');
    if (libroActual) {
      this.animationCtrl.create()
        .addElement(libroActual)
        .duration(1000)
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'translateY(20px)', 'translateY(0)')
        .play();
    }
  }

  irAProgreso(libro: any) {
    console.log('Libro original recibido:', libro);

    if (!libro || !libro.id) {
      this.showAlert('Error', 'No se puede acceder al progreso de este libro');
      return;
    }

    const libroNormalizado = {
      id: libro.id,
      title: libro.title || libro.titulo || 'Sin título',
      author: libro.author || libro.autor || 'Autor desconocido',
      totalPages: Number(libro.totalPages || libro.paginas || libro.total_pages || 0),
      progreso: Number(libro.progreso || 0),
      estado: libro.estado || 'leyendo'
    };

    console.log('Libro normalizado:', libroNormalizado);

    if (libroNormalizado.totalPages <= 0) {
      this.showAlert('Error', 'Este libro no tiene un número válido de páginas. Por favor, edita el libro y agrega el número total de páginas.');
      return;
    }

    this.router.navigate(['/progreso'], { 
      state: { libro: libroNormalizado },
      queryParams: { bookId: libroNormalizado.id }
    });
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  irAMiBiblioteca() {
    this.router.navigate(['/biblioteca']);
  }

  async abrirModalAgregarLibro(tipo: 'actual' | 'pendiente') {
  const modal = await this.modalCtrl.create({
    component: AddBookModalComponent,
    componentProps: { tipo },
  });

  modal.onDidDismiss().then(result => {
    if (result.data?.libro) {
      const nuevoLibro = {
        ...result.data.libro,
        id: this.generateId(),
        progreso: 0,
        estado: tipo === 'actual' ? 'leyendo' : 'pendiente'
      };

      if (tipo === 'actual') {
        this.booksService.addBook(nuevoLibro);
      } else {
        this.librosPorLeer.push(nuevoLibro);
        localStorage.setItem('librosPorLeer', JSON.stringify(this.librosPorLeer));

        this.booksService.addBook(nuevoLibro);
      }

      this.actualizarEstadisticas();
    }
  });

  await modal.present();
}


  empezarLibro(libro: any) {
    const libroParaActuales = {
      ...libro,
      id: libro.id || this.generateId(),
      progreso: 0,
      estado: 'leyendo'  // ✅ Pasa a 'leyendo'
    };

    const existe = this.librosActuales.some(l => l.id === libroParaActuales.id);
    if (!existe) {
      this.booksService.addBook(libroParaActuales);  // ✅ Lo manda al Swiper
    }

    this.librosPorLeer = this.librosPorLeer.filter(l => l.id !== libro.id);
    localStorage.setItem('librosPorLeer', JSON.stringify(this.librosPorLeer));

    this.actualizarEstadisticas();
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private actualizarEstadisticas() {
    this.booksService.libros$.subscribe(libros => {
      this.estadisticas.librosTerminados = libros.filter(libro => libro.estado === 'terminado').length;
    });
  }

  getEstadoColor(estado: string) {
    switch (estado) {
      case 'leyendo': return 'primary';
      case 'pausado': return 'warning';
      case 'pendiente': return 'medium';
      case 'terminado': return 'success';
      default: return 'light';
    }
  }

  getProgresoPercentage(libro: any): number {
    return Math.floor((libro.progreso || 0) * 100);
  }

  getProgressColor(progreso: number): string {
    if (progreso < 25) return 'danger';
    if (progreso < 50) return 'warning';
    if (progreso < 75) return 'primary';
    return 'success';
  }

  eliminarLibroPorLeer(libro: any) {
  this.librosPorLeer = this.librosPorLeer.filter(l => l.id !== libro.id);
  localStorage.setItem('librosPorLeer', JSON.stringify(this.librosPorLeer));
}


}


