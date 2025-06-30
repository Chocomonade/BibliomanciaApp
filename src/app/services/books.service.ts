import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  private librosSubject = new BehaviorSubject<any[]>([]);
  public libros$ = this.librosSubject.asObservable();

  constructor() {
    this.loadBooks();
  }

  loadBooks() {
    const librosGuardados = localStorage.getItem('librosActuales');
    const libros = librosGuardados ? JSON.parse(librosGuardados) : [];
    this.librosSubject.next(libros);
  }

  addBook(libro: any) {
    const libros = [...this.librosSubject.value];
    libros.push(libro);
    localStorage.setItem('librosActuales', JSON.stringify(libros));
    this.librosSubject.next(libros);
  }

  updateBook(bookId: string, updates: Partial<any>) {
    const libros = [...this.librosSubject.value];
    const index = libros.findIndex(l => l.id === bookId);

    if (index !== -1) {
      libros[index] = { ...libros[index], ...updates };
      localStorage.setItem('librosActuales', JSON.stringify(libros));
      this.librosSubject.next(libros);
    }
  }

  deleteBook(bookId: string) {
    const libros = this.librosSubject.value.filter(l => l.id !== bookId);
    localStorage.setItem('librosActuales', JSON.stringify(libros));
    this.librosSubject.next(libros);
  }

  getBooks(): any[] {
    return this.librosSubject.value;
  }
}
