import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import { BooksService } from '../../services/books.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

interface Libro {
  id: string;
  titulo: string;
  autor: string;
  portada: string;
  estado: 'pendiente' | 'leyendo' | 'terminado' | 'pausado';
  progreso?: number;
  fechaAgregado: Date;
  fechaInicio?: Date;
  fechaTerminado?: Date;
  genero?: string;
  paginas?: number;
}

@Component({
  selector: 'app-biblioteca',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule
  ],
  templateUrl: './biblioteca.page.html',
  styleUrls: ['./biblioteca.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class BibliotecaPage implements OnInit {

  biblioteca: Libro[] = [];
  librosFiltrados: Libro[] = [];
  filtroTexto: string = '';
  filtroEstado: string = 'todos';
  vistaGrid: boolean = true;

  get librosTotal(): number {
    return this.biblioteca.length;
  }

  constructor(
    private booksService: BooksService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    this.booksService.libros$.subscribe(libros => {
      this.biblioteca = libros;
      this.aplicarFiltros();
    });
    this.booksService.loadBooks();
  }

  cambiarVista() {
    this.vistaGrid = !this.vistaGrid;
  }

  filtrarLibros() {
    this.aplicarFiltros();
  }

  filtrarPorEstado(estado: string) {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let libros = [...this.biblioteca];

    if (this.filtroEstado !== 'todos') {
      libros = libros.filter(libro => libro.estado === this.filtroEstado);
    }

    if (this.filtroTexto.trim()) {
      const texto = this.filtroTexto.toLowerCase();
      libros = libros.filter(libro =>
        libro.titulo.toLowerCase().includes(texto) ||
        libro.autor.toLowerCase().includes(texto) ||
        (libro.genero && libro.genero.toLowerCase().includes(texto))
      );
    }

    this.librosFiltrados = libros;
  }

  contarPorEstado(estado: string): number {
    return this.biblioteca.filter(libro => libro.estado === estado).length;
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'leyendo': return 'book-outline';
      case 'terminado': return 'checkmark-circle';
      case 'pendiente': return 'bookmark-outline';
      case 'pausado': return 'pause-circle-outline';
      default: return 'book';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'leyendo': return 'Leyendo';
      case 'terminado': return 'Terminado';
      case 'pendiente': return 'Pendiente';
      case 'pausado': return 'Pausado';
      default: return 'Desconocido';
    }
  }

  empezarLibro(libro: Libro) {
    libro.estado = 'leyendo';
    libro.fechaInicio = new Date();
    libro.progreso = libro.progreso || 0;
    this.booksService.updateBook(libro.id, libro);
    this.aplicarFiltros();
    this.mostrarToast(`Empezando "${libro.titulo}"`);
  }

  continuarLibro(libro: Libro) {
    this.router.navigate(['/progreso'], {
      state: { libro },
      queryParams: { bookId: libro.id }
    });
  }

  async mostrarOpcionesLibro(libro: Libro) {
    const buttons = [];

    if (libro.estado === 'pendiente') {
      buttons.push({
        text: 'Empezar a leer',
        icon: 'play',
        handler: () => this.empezarLibro(libro)
      });
    }

    if (libro.estado === 'leyendo') {
      buttons.push({
        text: 'Continuar leyendo',
        icon: 'book-outline',
        handler: () => this.continuarLibro(libro)
      });
      buttons.push({
        text: 'Pausar',
        icon: 'pause',
        handler: () => this.cambiarEstadoLibro(libro, 'pausado')
      });
      buttons.push({
        text: 'Marcar como terminado',
        icon: 'checkmark-circle',
        handler: () => this.cambiarEstadoLibro(libro, 'terminado')
      });
    }

    if (libro.estado === 'pausado') {
      buttons.push({
        text: 'Reanudar lectura',
        icon: 'play',
        handler: () => this.cambiarEstadoLibro(libro, 'leyendo')
      });
      buttons.push({
        text: 'Volver a pendientes',
        icon: 'bookmark',
        handler: () => this.cambiarEstadoLibro(libro, 'pendiente')
      });
    }

    if (libro.estado === 'terminado') {
      buttons.push({
        text: 'Releer',
        icon: 'refresh',
        handler: () => this.releerLibro(libro)
      });
    }

    buttons.push({
      text: 'Editar información',
      icon: 'create',
      handler: () => this.editarLibro(libro)
    });

    buttons.push({
      text: 'Eliminar de biblioteca',
      icon: 'trash',
      role: 'destructive',
      handler: () => this.eliminarLibro(libro)
    });

    buttons.push({
      text: 'Cancelar',
      icon: 'close',
      role: 'cancel'
    });

    const actionSheet = await this.actionSheetController.create({
      header: libro.titulo,
      buttons: buttons
    });

    await actionSheet.present();
  }

  cambiarEstadoLibro(libro: Libro, nuevoEstado: 'pendiente' | 'leyendo' | 'terminado' | 'pausado') {
    libro.estado = nuevoEstado;
    if (nuevoEstado === 'terminado') {
      libro.progreso = 1;
      libro.fechaTerminado = new Date();
    } else if (nuevoEstado === 'leyendo' && !libro.fechaInicio) {
      libro.fechaInicio = new Date();
    }
    this.booksService.updateBook(libro.id, libro);
    this.aplicarFiltros();
    this.mostrarToast(`"${libro.titulo}" marcado como ${this.getEstadoTexto(nuevoEstado).toLowerCase()}`);
  }

  releerLibro(libro: Libro) {
    libro.estado = 'leyendo';
    libro.progreso = 0;
    libro.fechaInicio = new Date();
    this.booksService.updateBook(libro.id, libro);
    this.aplicarFiltros();
    this.mostrarToast(`Empezando a releer "${libro.titulo}"`);
  }

  async editarLibro(libro: Libro) {
    const alert = await this.alertController.create({
      header: 'Editar libro',
      inputs: [
        { name: 'titulo', type: 'text', value: libro.titulo },
        { name: 'autor', type: 'text', value: libro.autor },
        { name: 'genero', type: 'text', value: libro.genero || '' },
        { name: 'paginas', type: 'number', value: libro.paginas?.toString() || '' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            libro.titulo = data.titulo;
            libro.autor = data.autor;
            libro.genero = data.genero || undefined;
            libro.paginas = data.paginas ? parseInt(data.paginas) : undefined;
            this.booksService.updateBook(libro.id, libro);
            this.aplicarFiltros();
            this.mostrarToast('Libro actualizado');
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarLibro(libro: Libro) {
    const alert = await this.alertController.create({
      header: 'Eliminar libro',
      message: `¿Estás seguro de eliminar "${libro.titulo}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.booksService.deleteBook(libro.id);
            this.aplicarFiltros();
            this.mostrarToast(`"${libro.titulo}" eliminado`);
          }
        }
      ]
    });

    await alert.present();
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}
