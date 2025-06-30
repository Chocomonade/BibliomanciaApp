import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Libro {
  titulo: string;
  autores: string[];
  portadaUrl: string;
  paginas: number;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class LibroApiService {

  constructor(private http: HttpClient) {}

  buscarLibros(query: string): Observable<Libro[]> {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`;

    return this.http.get<any>(url).pipe(
      map(response => {
        return response.items.map((item: any) => ({
          titulo: item.volumeInfo.title || 'Sin título',
          autores: item.volumeInfo.authors || ['Desconocido'],
          portadaUrl: item.volumeInfo.imageLinks?.thumbnail || 'assets/placeholder.png',
          paginas: item.volumeInfo.pageCount || 0,
          descripcion: item.volumeInfo.description || 'Sin descripción disponible.'
        }));
      })
    );
  }
}
