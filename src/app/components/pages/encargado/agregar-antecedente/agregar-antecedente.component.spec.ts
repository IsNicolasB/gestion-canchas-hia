import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarAntecedenteComponent } from './agregar-antecedente.component';

describe('AgregarAntecedenteComponent', () => {
  let component: AgregarAntecedenteComponent;
  let fixture: ComponentFixture<AgregarAntecedenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarAntecedenteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarAntecedenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
