import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloquearHorariosComponent } from './bloquear-horarios.component';

describe('BloquearHorariosComponent', () => {
  let component: BloquearHorariosComponent;
  let fixture: ComponentFixture<BloquearHorariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloquearHorariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BloquearHorariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
