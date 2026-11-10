package com.agrocloud.backend.plan.decorator;

/** Backwards compatibility subclass for RespaldoDiario */
public class RespaldoDiario extends DailyBackupDecorator {
    public RespaldoDiario(ContractablePlan wrappee) { super(wrappee); }
}
