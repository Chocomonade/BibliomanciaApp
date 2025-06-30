import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { BooksService } from '../../services/books.service';

@Component({
  selector: 'app-progreso',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './progreso.page.html',
  styleUrls: ['./progreso.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProgresoPage implements OnInit {
  currentBook: any = null;

  progressForm = {
    currentPage: 0,
    date: new Date().toISOString(),
    notes: ''
  };

  readingHistory: any[] = [];
  progressPercentage = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private booksService: BooksService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    console.log('ProgresoPage ngOnInit iniciado');
    this.loadCurrentBook();
  }

  loadCurrentBook() {
    console.log('Intentando cargar libro...');
    
    // Método 1: Desde navigation state
    const nav = this.router.getCurrentNavigation();
    let libro = nav?.extras?.state?.['libro'];
    console.log('Libro desde navigation:', libro);

    if (libro && this.isValidBook(libro)) {
      console.log('Libro válido encontrado en navigation');
      this.initializeBook(libro);
      return;
    }

    // Método 2: Desde query params
    const bookId = this.route.snapshot.queryParamMap.get('bookId');
    console.log('BookId desde query params:', bookId);
    
    if (bookId) {
      // Obtener libro del servicio por ID
      this.booksService.libros$.subscribe(libros => {
        console.log('Libros disponibles:', libros);
        libro = libros.find(l => l.id === bookId);
        console.log('Libro encontrado por ID:', libro);
        
        if (libro && this.isValidBook(libro)) {
          this.initializeBook(libro);
        } else {
          this.handleNoBook();
        }
      });
      
      // Forzar carga de libros
      this.booksService.loadBooks();
      return;
    }

    // Método 3: Desde localStorage como respaldo
    const savedBooks = JSON.parse(localStorage.getItem('librosActuales') || '[]');
    console.log('Libros en localStorage:', savedBooks);
    
    if (savedBooks.length > 0) {
      // Por ahora, tomar el primer libro como ejemplo
      // En producción, necesitarías una mejor forma de identificar cuál libro mostrar
      libro = savedBooks[0];
      if (this.isValidBook(libro)) {
        console.log('Usando primer libro de localStorage:', libro);
        this.initializeBook(libro);
        return;
      }
    }

    // Si llegamos aquí, no hay libro válido
    this.handleNoBook();
  }

  isValidBook(libro: any): boolean {
    const isValid = libro && 
                   libro.id && 
                   libro.title && 
                   libro.totalPages && 
                   libro.totalPages > 0;
    
    console.log('Validación de libro:', {
      libro,
      isValid,
      hasId: !!libro?.id,
      hasTitle: !!libro?.title,
      hasTotalPages: !!libro?.totalPages,
      totalPagesValue: libro?.totalPages
    });
    
    return isValid;
  }

  initializeBook(libro: any) {
    // Normalizar el objeto libro
    this.currentBook = {
      id: libro.id,
      title: libro.title || libro.titulo,
      author: libro.author || libro.autor || 'Autor desconocido',
      totalPages: Number(libro.totalPages || libro.paginas || 0),
      progreso: Number(libro.progreso || 0),
      estado: libro.estado || 'leyendo'
    };
    
    console.log('Libro inicializado:', this.currentBook);
    
    // Validar una vez más después de normalizar
    if (!this.isValidBook(this.currentBook)) {
      console.error('Libro sigue siendo inválido después de normalización');
      this.handleNoBook();
      return;
    }
    
    // Cargar historial y progreso
    this.loadReadingHistory();
    this.calculateProgress();
  }

  handleNoBook() {
    console.log('No se encontró libro válido, redirigiendo...');
    this.showAlert('Error', 'No se pudo cargar la información del libro').then(() => {
      this.router.navigate(['/home']);
    });
  }

  loadReadingHistory() {
    if (!this.currentBook?.id) {
      console.log('No se puede cargar historial sin ID de libro');
      return;
    }

    const allProgress = JSON.parse(localStorage.getItem('readingHistory') || '[]');
    console.log('Todo el historial:', allProgress);
    
    this.readingHistory = allProgress
      .filter((p: any) => p.bookId === this.currentBook.id)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log('Historial filtrado para este libro:', this.readingHistory);

    // Establecer la página actual basada en el último progreso
    if (this.readingHistory.length > 0) {
      this.progressForm.currentPage = this.readingHistory[0].currentPage;
      console.log('Página actual desde historial:', this.progressForm.currentPage);
    } else {
      // Si no hay historial, usar el progreso actual del libro
      this.progressForm.currentPage = Math.round((this.currentBook.progreso || 0) * this.currentBook.totalPages);
      console.log('Página actual calculada desde progreso:', this.progressForm.currentPage);
    }

    this.calculateProgress();
  }

  calculateProgress() {
  if (!this.currentBook?.totalPages) {
    console.log('No se puede calcular progreso sin totalPages');
    return;
  }

  const rawPercentage = (this.progressForm.currentPage / this.currentBook.totalPages) * 100;

  if (this.progressForm.currentPage >= this.currentBook.totalPages) {
    this.progressPercentage = 100;
    this.currentBook.estado = 'terminado';
  } else {
    this.progressPercentage = Math.floor(rawPercentage);
    if (this.progressPercentage > 0 && this.currentBook.estado === 'pendiente') {
      this.currentBook.estado = 'leyendo';
    }
  }

  console.log('Progreso calculado:', {
    currentPage: this.progressForm.currentPage,
    totalPages: this.currentBook.totalPages,
    percentage: this.progressPercentage
  });
}


  async saveProgress() {
    console.log('Intentando guardar progreso...');
    console.log('Estado actual del libro:', this.currentBook);
    console.log('Formulario de progreso:', this.progressForm);

    // Validación más específica
    if (!this.currentBook) {
      await this.showAlert('Error', 'No hay libro cargado');
      return;
    }

    if (!this.currentBook.id) {
      await this.showAlert('Error', 'El libro no tiene un ID válido');
      return;
    }

    if (!this.currentBook.totalPages || this.currentBook.totalPages <= 0) {
      await this.showAlert('Error', 'El libro no tiene un número válido de páginas');
      return;
    }

    if (this.progressForm.currentPage < 0 || this.progressForm.currentPage > this.currentBook.totalPages) {
      await this.showAlert('Error', `La página debe estar entre 0 y ${this.currentBook.totalPages}`);
      return;
    }

    try {
      const newProgress = {
        id: Date.now().toString(),
        bookId: this.currentBook.id,
        bookTitle: this.currentBook.title,
        currentPage: Number(this.progressForm.currentPage),
        totalPages: Number(this.currentBook.totalPages),
        date: this.progressForm.date,
        notes: this.progressForm.notes || ''
      };

      console.log('Nuevo progreso a guardar:', newProgress);

      // Guardar en historial
      const allProgress = JSON.parse(localStorage.getItem('readingHistory') || '[]');
      allProgress.unshift(newProgress);
      localStorage.setItem('readingHistory', JSON.stringify(allProgress));
      console.log('Progreso guardado en localStorage');

      // Actualizar el progreso del libro
      const progresoDecimal = this.progressPercentage / 100;
      this.currentBook.progreso = progresoDecimal;

      console.log('Actualizando libro con progreso:', progresoDecimal);

      // Actualizar libro en el servicio
      await this.booksService.updateBook(this.currentBook.id, {
        progreso: progresoDecimal,
        estado: this.currentBook.estado
      });

      // Recargar historial
      this.loadReadingHistory();

      await this.showToast('Progreso guardado correctamente');
      
      // Limpiar formulario
      this.progressForm.notes = '';
      this.progressForm.date = new Date().toISOString();

    } catch (error) {
      console.error('Error guardando progreso:', error);
      await this.showAlert('Error', 'No se pudo guardar el progreso. Inténtalo de nuevo.');
    }
  }

  async deleteProgress(progress: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que quieres eliminar este registro?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              const allProgress = JSON.parse(localStorage.getItem('readingHistory') || '[]');
              const updated = allProgress.filter((p: any) => p.id !== progress.id);
              localStorage.setItem('readingHistory', JSON.stringify(updated));
              
              // Recargar historial
              this.loadReadingHistory();
              
              // Si se eliminó el último progreso, actualizar el libro
              if (this.readingHistory.length > 0) {
                const lastProgress = this.readingHistory[0];
                this.progressForm.currentPage = lastProgress.currentPage;
                this.calculateProgress();
                
                await this.booksService.updateBook(this.currentBook.id, {
                  progreso: this.progressPercentage / 100,
                  estado: this.currentBook.estado
                });
              }
              
              await this.showToast('Registro eliminado');
            } catch (error) {
              console.error('Error eliminando progreso:', error);
              await this.showAlert('Error', 'No se pudo eliminar el registro');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    await toast.present();
  }

  getProgressColor(): string {
    if (this.progressPercentage < 25) return 'danger';
    if (this.progressPercentage < 50) return 'warning';
    if (this.progressPercentage < 75) return 'primary';
    return 'success';
  }

  onPageInputChange() {
    console.log('Página cambiada a:', this.progressForm.currentPage);
    this.calculateProgress();
  }
}








