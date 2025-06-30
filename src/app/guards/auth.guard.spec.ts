import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true if username exists', () => {
    spyOn(localStorage, 'getItem').and.returnValue('testuser');

    const result = guard.canActivate();

    expect(result).toBeTrue();
  });

  it('should redirect to /login if user is not logged in', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);

    // Devuelve un UrlTree simulado
    const fakeUrlTree: UrlTree = {} as UrlTree;
    routerSpy.parseUrl.and.returnValue(fakeUrlTree);

    const result = guard.canActivate();

    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/login');
    expect(result).toBe(fakeUrlTree);
  });
});

