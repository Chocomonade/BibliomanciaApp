import { Component } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-buscar-por-isbn',
  standalone: true,
  templateUrl: './buscar-por-isbn.page.html',
  styleUrls: ['./buscar-por-isbn.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class BuscarPorIsbnPage {
  isbn = '';

  constructor(private modalCtrl: ModalController, private http: HttpClient, private router: Router) {}

  cerrar() {
    this.modalCtrl.dismiss();
  }

  libroEncontrado: any = null;

 buscarPorISBN() {
  if (!this.isbn.trim()) return;

  const isbnQuery = encodeURIComponent(`isbn:${this.isbn}`);
  this.http.get(`https://www.googleapis.com/books/v1/volumes?q=${isbnQuery}`)
    .subscribe((res: any) => {
      const libro = res.items?.[0]?.volumeInfo;
      if (libro) {
        this.libroEncontrado = {
          titulo: libro.title || 'Sin título',
          autor: libro.authors?.join(', ') || 'Autor desconocido',
          portada: libro.imageLinks?.thumbnail?.replace('http://', 'https://') || 'assets/img/sin-portada.jpg',
          resumen: libro.description || 'Sin descripción',
          paginas: libro.pageCount || 0
        };
      } else {
        alert('No se encontró ningún libro con ese ISBN.');
      }
    });
}

  seleccionarLibro() {
    if (this.libroEncontrado) {
      this.modalCtrl.dismiss({
        libro: this.libroEncontrado
      });
    }
}


  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    const isbn = nav?.extras?.state?.['isbn'];

    if (isbn) {
      this.isbn = isbn;
      this.buscarPorISBN();
    }
  }
}

