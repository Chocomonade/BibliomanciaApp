import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  public dbInstance!: SQLiteObject;
  public isReady = false;

  constructor(private sqlite: SQLite) {
    this.initializeDataBase();
   }

  async initializeDataBase() {
    this.dbInstance = await this.sqlite.create({
      name: 'mydatabase.db',
      location: 'default',
    });
    await this.createTables();
  }

  //Crear tabla con los nuevos campos

  async createTables() {
    await this.dbInstance.executeSql(
      `CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      nivel_lectura TEXT,
      fecha_nacimiento TEXT
      )`,
      []
    );
  }

  async registerUser(email: string, username: string, password: string, nivel_lectura: string, fecha_nacimiento: string): Promise<boolean> {
  try {
    await this.dbInstance.executeSql (
      `INSERT INTO users (email, username, password, nivel_lectura, fecha_nacimiento)
       VALUES (?, ?, ?, ?, ?)`,
       [email, username, password, nivel_lectura, fecha_nacimiento]
    );
    return true;
  } catch (error) {
    console.error('Error al registrar usuario', error);
    return false;
  }
}

 async loginUser(username: string, password: string): Promise<boolean> {
    const result = await this.dbInstance.executeSql(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (result.rows.length > 0) {
    localStorage.setItem('username', username);
    return true;
  }
  return false;
 }
}
