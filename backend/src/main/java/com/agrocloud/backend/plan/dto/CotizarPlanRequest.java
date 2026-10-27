package com.agrocloud.backend.plan.dto;

import com.agrocloud.backend.plan.decorator.Complemento;
import java.util.List;

/** Cuerpo de POST /api/v1/planes/{id}/cotizar. Ejemplo: {"complementos": ["ALMACENAMIENTO_EXTRA"]} */
public record CotizarPlanRequest(List<Complemento> complementos) {}
