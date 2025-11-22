import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerAntecedentesComponent } from './ver-antecedentes.component';

describe('VerAntecedentesComponent', () => {
  let component: VerAntecedentesComponent;
  let fixture: ComponentFixture<VerAntecedentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerAntecedentesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerAntecedentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
