package com.agrocloud.backend.plan.decorator;

/** Backwards compatibility subclass for SoportePrioritario */
public class SoportePrioritario extends PrioritySupportDecorator {
    public SoportePrioritario(ContractablePlan wrappee) { super(wrappee); }
}
