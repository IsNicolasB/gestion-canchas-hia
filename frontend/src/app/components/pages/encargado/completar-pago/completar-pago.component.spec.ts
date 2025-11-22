import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletarPagoComponent } from './completar-pago.component';

describe('CompletarPagoComponent', () => {
  let component: CompletarPagoComponent;
  let fixture: ComponentFixture<CompletarPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletarPagoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompletarPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
