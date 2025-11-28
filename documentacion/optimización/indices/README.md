# Índices y Optimización – Guía de Uso

Este README resume qué documentos aportan valor práctico hoy y cuáles conviene archivar en `_histórico/` para reducir ruido.

## Mantener (útiles)
- `INFORME_OPTIMIZACIONES_FASE_D.md`: Documento técnico principal con cambios, métricas y resultados.
- `RESUMEN_MEJORAS_FASE_D.md`: Versión ejecutiva para stakeholders.
- `queries_optimizadas_final.md`: Compendio final de consultas optimizadas (referencia de implementación).
- `queries_con_indices.md`: Mapa de qué índice soporta cada consulta (cobertura de índices).
- `comparacion_queries.md` **o** `Comparación Fase A-B-C Optimizacion.md`: Conserva **uno** (el más claro y con métricas). El otro se archiva.

## Archivar en `_histórico/` (intermedios/duplicados)
- `queries_sin_indices.md`
- `queries_fase_D.md`
- `queries_fase_D_optimizado.md`
- `queries_fase_D_validated.md`
- `queries_fase_c_real.md`
- El duplicado entre `comparacion_queries.md` y `Comparación Fase A-B-C Optimizacion.md` (elige uno para mantener).

## Próximo paso sugerido
Si confirmas, moveré los archivos listados arriba a `documentacion/optimización/indices/_histórico/` (sin pérdida de contenido) y dejaré esta carpeta solo con los 4-5 documentos clave.

## Razón de la selección
- Eliminamos versiones intermedias y redundantes; mantenemos el “estado final” + informe y resumen.
- Simplifica auditorías de performance y onboarding de equipo.
- Evita confusiones de cuál versión usar.

---

Última actualización: 26-11-2025