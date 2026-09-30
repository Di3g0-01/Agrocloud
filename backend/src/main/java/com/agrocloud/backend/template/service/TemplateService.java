package com.agrocloud.backend.template.service;

import com.agrocloud.backend.template.dto.CreateTemplateDto;
import com.agrocloud.backend.template.dto.TemplateDto;
import com.agrocloud.backend.template.entity.TemplateEntity;
import com.agrocloud.backend.template.repository.TemplateRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TemplateService {

    private final TemplateRepository templateRepository;

    public TemplateService(TemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @PostConstruct
    public void initDefaultTemplates() {
        if (templateRepository.count() == 0) {
            List<TemplateEntity> defaults = List.of(
                new TemplateEntity(
                    "TPL-01",
                    "Cultivos y parcelas",
                    "Estructura relacional para la administración de parcelas, cultivos, etapas de crecimiento y rendimiento agrícola.",
                    8,
                    "2.1",
                    12,
                    "Activa",
                    "parcelas,cultivos,siembras,cosechas,variedades,suelos,sectores,bitacora"
                ),
                new TemplateEntity(
                    "TPL-02",
                    "Monitoreo de riego y fertilización",
                    "Esquema optimizado para la captura de lecturas de sensores de humedad, flujo de agua y programas de fertirriego.",
                    6,
                    "1.4",
                    8,
                    "Activa",
                    "sensores,lecturas,valvulas,programas_riego,fertilizantes,aplicaciones"
                ),
                new TemplateEntity(
                    "TPL-03",
                    "Control de plagas y fitosanitario",
                    "Base de datos para el seguimiento de monitoreos de plagas, tratamientos químicos/orgánicos y períodos de carencia.",
                    5,
                    "1.0",
                    4,
                    "Activa",
                    "plagas,monitoreos,productos_fitosanitarios,aplicaciones,periodos_carencia"
                ),
                new TemplateEntity(
                    "TPL-04",
                    "Inventarios y bodegas agrícolas",
                    "Gestión de insumos, maquinaria, repuestos, herramientas y movimientos de entrada/salida en bodega.",
                    7,
                    "1.8",
                    15,
                    "Activa",
                    "insumos,bodegas,movimientos,proveedores,maquinaria,mantenimientos,existencias"
                )
            );
            templateRepository.saveAll(defaults);
        }
    }

    @Transactional(readOnly = true)
    public List<TemplateDto> getAllTemplates() {
        return templateRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public TemplateDto createTemplate(CreateTemplateDto dto) {
        List<String> schemaList = (dto.schema() != null && !dto.schema().isEmpty())
                ? dto.schema()
                : List.of("registro", "datos", "reportes");

        String schemaStr = String.join(",", schemaList);
        String uniqueId = "TPL-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);

        TemplateEntity entity = new TemplateEntity(
                uniqueId,
                dto.nombre(),
                dto.descripcion(),
                schemaList.size(),
                dto.version() != null ? dto.version() : "1.0",
                0,
                dto.estado() != null ? dto.estado() : "Activa",
                schemaStr
        );

        TemplateEntity saved = templateRepository.save(entity);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteTemplate(String id) {
        templateRepository.deleteById(id);
    }

    private TemplateDto mapToDto(TemplateEntity entity) {
        List<String> schemaList = entity.getSchemaTables() != null && !entity.getSchemaTables().isBlank()
                ? Arrays.asList(entity.getSchemaTables().split(","))
                : List.of();

        return new TemplateDto(
                entity.getId(),
                entity.getNombre(),
                entity.getDescripcion(),
                entity.getTablas(),
                entity.getVersion(),
                entity.getInstancias(),
                entity.getEstado(),
                "Hoy",
                schemaList
        );
    }
}
