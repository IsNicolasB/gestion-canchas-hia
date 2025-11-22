import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReasignarReservaComponent } from './reasignar-reserva.component';

describe('ReasignarReservaComponent', () => {
  let component: ReasignarReservaComponent;
  let fixture: ComponentFixture<ReasignarReservaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReasignarReservaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReasignarReservaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
