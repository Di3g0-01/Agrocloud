package com.agrocloud.backend.template.service;

import com.agrocloud.backend.template.dto.CreateTemplateDto;
import com.agrocloud.backend.template.dto.TemplateDto;
import com.agrocloud.backend.template.entity.TemplateEntity;
import com.agrocloud.backend.template.repository.TemplateRepository;
import com.agrocloud.backend.instance.repository.InstanceRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TemplateService {

    private final TemplateRepository templateRepository;
    private final InstanceRepository instanceRepository;

    public TemplateService(TemplateRepository templateRepository, InstanceRepository instanceRepository) {
        this.templateRepository = templateRepository;
        this.instanceRepository = instanceRepository;
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
        if (templateRepository.findByNombreIgnoreCase(dto.nombre().trim()).isPresent()) {
            throw new IllegalStateException("Ya existe una plantilla con ese nombre");
        }
        List<String> schemaList = (dto.schema() != null && !dto.schema().isEmpty())
                ? dto.schema()
                : List.of("registro", "datos", "reportes");

        String schemaStr = String.join(",", schemaList);
        String uniqueId = "TPL-" + UUID.randomUUID();

        TemplateEntity entity = new TemplateEntity(
                uniqueId,
                dto.nombre().trim(),
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
        TemplateEntity entity = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Plantilla no encontrada"));
        if (instanceRepository.countByTemplateIgnoreCase(entity.getNombre()) > 0) {
            throw new IllegalStateException("No se puede eliminar una plantilla utilizada por instancias");
        }
        templateRepository.deleteById(id);
    }

    @Transactional
    public TemplateDto updateTemplate(String id, CreateTemplateDto dto) {
        TemplateEntity entity = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Plantilla no encontrada"));
        templateRepository.findByNombreIgnoreCase(dto.nombre().trim()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) throw new IllegalStateException("Ya existe una plantilla con ese nombre");
        });
        if (!entity.getNombre().equals(dto.nombre()) && instanceRepository.countByTemplateIgnoreCase(entity.getNombre()) > 0) {
            throw new IllegalStateException("No se puede cambiar el nombre de una plantilla utilizada por instancias");
        }
        entity.setNombre(dto.nombre().trim());
        entity.setDescripcion(dto.descripcion());
        entity.setVersion(dto.version() == null || dto.version().isBlank() ? entity.getVersion() : dto.version());
        entity.setEstado(dto.estado() == null ? entity.getEstado() : dto.estado());
        if (dto.schema() != null) {
            entity.setSchemaTables(String.join(",", dto.schema()));
            entity.setTablas(dto.schema().size());
        }
        return mapToDto(templateRepository.save(entity));
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
                Math.toIntExact(instanceRepository.countByTemplateIgnoreCase(entity.getNombre())),
                entity.getEstado(),
                entity.getUpdatedAt() == null ? "" : entity.getUpdatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE),
                schemaList
        );
    }
}
