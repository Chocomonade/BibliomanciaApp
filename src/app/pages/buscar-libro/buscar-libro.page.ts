import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-buscar-libro',
  standalone: true, 
  templateUrl: './buscar-libro.page.html',
  styleUrls: ['./buscar-libro.page.scss'],
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule 
  ],
})
export class BuscarLibroPage {
  query: string = '';
  resultados: any[] = [];

  constructor(private http: HttpClient, private router: Router, private modalCtrl: ModalController) {}

buscar() {
  if (!this.query.trim() || this.query.length < 3) return;

  const queryParam = encodeURIComponent(this.query);
  this.http.get(`https://www.googleapis.com/books/v1/volumes?q=${queryParam}`)
    .subscribe((res: any) => {
      this.resultados = res.items?.map((item: any) => ({
        titulo: item.volumeInfo?.title || 'Sin título',
        autor: item.volumeInfo?.authors?.join(', ') || 'Autor desconocido',
        portada: item.volumeInfo?.imageLinks?.thumbnail?.replace('http://', 'https://') || 'assets/img/sin-portada.jpg',
        resumen: item.volumeInfo?.description || 'Sin descripción',
        paginas: item.volumeInfo?.pageCount || 0
      })) || [];
    });
}

  seleccionarLibro(libro: any) {
  this.modalCtrl.dismiss({
    libro: libro
    });
  }

  cerrar() {
      this.modalCtrl.dismiss();
    }

}

