import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuscarPorIsbnPage } from './buscar-por-isbn.page';

describe('BuscarPorIsbnPage', () => {
  let component: BuscarPorIsbnPage;
  let fixture: ComponentFixture<BuscarPorIsbnPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarPorIsbnPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
