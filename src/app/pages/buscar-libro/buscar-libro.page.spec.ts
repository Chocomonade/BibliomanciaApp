import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuscarLibroPage } from './buscar-libro.page';

describe('BuscarLibroPage', () => {
  let component: BuscarLibroPage;
  let fixture: ComponentFixture<BuscarLibroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarLibroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
