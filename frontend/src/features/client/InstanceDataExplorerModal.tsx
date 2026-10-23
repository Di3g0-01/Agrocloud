import React, { useState, useEffect } from "react";
import {
  getInstanceTables,
  getInstanceTableData,
  createCustomTable,
  getInstanceTableColumns,
  insertInstanceTableRow,
} from "../../api/instancesApi";
import type {
  InstanceTableInfo,
  CreateTablePayload,
  TableColumnMetadata,
} from "../../api/instancesApi";
import { CopyBtn } from "../../components/ui/index";

interface InstanceDataExplorerModalProps {
  instanceId: string;
  instanceName: string;
  templateName?: string;
  onClose: () => void;
}

export function InstanceDataExplorerModal({
  instanceId,
  instanceName,
  templateName,
  onClose,
}: InstanceDataExplorerModalProps) {
  const [tables, setTables] = useState<InstanceTableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "json">("table");
  const [activeTab, setActiveTab] = useState<"explorer" | "diagram">("explorer");

  // Estado para el modal de Crear Nueva Tabla
  const [showCreateTableModal, setShowCreateTableModal] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [columnsList, setColumnsList] = useState<CreateTablePayload["columns"]>([
    { name: "codigo", type: "VARCHAR", length: 50, nullable: false, primaryKey: false },
    { name: "descripcion", type: "TEXT", nullable: true, primaryKey: false }
  ]);
  const [creatingTable, setCreatingTable] = useState(false);

  // Estado para el modal de Insertar Fila
  const [showInsertRowModal, setShowInsertRowModal] = useState(false);
  const [tableColumns, setTableColumns] = useState<TableColumnMetadata[]>([]);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [insertingRow, setInsertingRow] = useState(false);

  const loadTables = async () => {
    try {
      setLoadingTables(true);
      setError("");
      const data = await getInstanceTables(instanceId);
      setTables(data);
      if (data.length > 0 && !selectedTable) {
        setSelectedTable(data[0].nombre);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "No se pudieron cargar las tablas de esta instancia.");
    } finally {
      setLoadingTables(false);
    }
  };

  const loadRowsForTable = async (tName: string) => {
    if (!tName) {
      setRows([]);
      return;
    }
    try {
      setLoadingRows(true);
      setError("");
      const data = await getInstanceTableData(instanceId, tName, 50);
      setRows(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || `Error al consultar datos de ${tName}`);
    } finally {
      setLoadingRows(false);
    }
  };

  const handleOpenInsertModal = async () => {
    if (!selectedTable) return;
    try {
      setLoadingColumns(true);
      setError("");
      const cols = await getInstanceTableColumns(instanceId, selectedTable);
      setTableColumns(cols);
      // Inicializar newRowData con valores por defecto
      const initial: Record<string, any> = {};
      cols.forEach((col) => {
        if (col.column_name.toLowerCase() !== "id") {
          initial[col.column_name] = "";
        }
      });
      setNewRowData(initial);
      setShowInsertRowModal(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || `No se pudieron cargar las columnas de ${selectedTable}`);
    } finally {
      setLoadingColumns(false);
    }
  };

  const handleInsertRowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;
    try {
      setInsertingRow(true);
      setError("");

      // Filtrar valores vacíos que no sean requeridos para que tomen DEFAULT si aplica
      const cleanedData: Record<string, any> = {};
      tableColumns.forEach((c) => {
        const key = c.column_name;
        if (key.toLowerCase() === "id") return;
        const val = newRowData[key];
        if (val !== undefined && val !== "") {
          const type = c.data_type.toLowerCase();
          if (type.includes("int") || type.includes("serial")) {
            cleanedData[key] = parseInt(val, 10);
          } else if (type.includes("numeric") || type.includes("float") || type.includes("double") || type.includes("real")) {
            cleanedData[key] = parseFloat(val);
          } else if (type.includes("bool")) {
            cleanedData[key] = val === "true" || val === true;
          } else {
            cleanedData[key] = val;
          }
        }
      });

      await insertInstanceTableRow(instanceId, selectedTable, cleanedData);
      setSuccessMsg(`Registro insertado con éxito en '${selectedTable}'.`);
      setShowInsertRowModal(false);
      await loadRowsForTable(selectedTable);
      await loadTables(); // Actualizar contador de filas
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.message || `Error al insertar fila en ${selectedTable}`);
    } finally {
      setInsertingRow(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, [instanceId]);

  useEffect(() => {
    if (!selectedTable) {
      setRows([]);
      return;
    }
    let isMounted = true;
    async function loadRows() {
      try {
        setLoadingRows(true);
        setError("");
        const data = await getInstanceTableData(instanceId, selectedTable, 50);
        if (isMounted) setRows(data);
      } catch (err: any) {
        if (isMounted) {
          setError(err?.response?.data?.message || `Error al consultar datos de ${selectedTable}`);
        }
      } finally {
        if (isMounted) setLoadingRows(false);
      }
    }
    loadRows();
    return () => {
      isMounted = false;
    };
  }, [instanceId, selectedTable]);

  const handleAddColumn = () => {
    setColumnsList((prev) => [
      ...prev,
      { name: `col_${prev.length + 1}`, type: "VARCHAR", length: 100, nullable: true, primaryKey: false }
    ]);
  };

  const handleRemoveColumn = (index: number) => {
    setColumnsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleColumnChange = (index: number, field: string, value: any) => {
    setColumnsList((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleCreateTableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) {
      setError("Debes ingresar un nombre de tabla válido.");
      return;
    }
    try {
      setCreatingTable(true);
      setError("");
      await createCustomTable(instanceId, {
        tableName: newTableName.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
        columns: columnsList
      });
      setSuccessMsg(`Tabla '${newTableName}' creada exitosamente en la base de datos.`);
      setShowCreateTableModal(false);
      setNewTableName("");
      await loadTables();
      setSelectedTable(newTableName.toLowerCase().replace(/[^a-z0-9_]/g, "_"));
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "No se pudo crear la tabla en PostgreSQL.");
    } finally {
      setCreatingTable(false);
    }
  };

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-gray-200"
        role="dialog"
        aria-modal="true"
        aria-label="Explorador de Tablas y Modelo de Datos"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400/20 border border-lime-400/30 flex items-center justify-center text-lime-400 font-bold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7z M9 12h6m-6 4h6" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">{instanceName}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  DBaaS Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Plantilla: <strong className="text-slate-200">{templateName || "Cultivos y parcelas"}</strong> · Esquema PostgreSQL aislado
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Pestañas: Explorador vs Diagrama Relacional */}
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab("explorer")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeTab === "explorer" ? "bg-lime-400 text-slate-950 font-semibold shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                Datos y Tablas
              </button>
              <button
                onClick={() => setActiveTab("diagram")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeTab === "diagram" ? "bg-lime-400 text-slate-950 font-semibold shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                Diagrama de Inserción
              </button>
            </div>

            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Notificaciones */}
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200 text-xs text-red-700 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700 font-bold text-sm">×</button>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")} className="text-emerald-700 hover:text-emerald-900 font-bold text-sm">×</button>
          </div>
        )}

        {/* Tab 1: Explorador de Datos */}
        {activeTab === "explorer" && (
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar: Lista de Tablas y Botón Crear Tabla */}
            <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0">
              <div className="p-3 border-b border-gray-200 bg-gray-100/70 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Tablas ({tables.length})</span>
                <button
                  onClick={() => setShowCreateTableModal(true)}
                  className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-white border border-emerald-300 hover:bg-emerald-50 rounded shadow-sm transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Nueva Tabla
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loadingTables ? (
                  <div className="p-4 text-center text-xs text-gray-500">Cargando esquema...</div>
                ) : tables.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">No se encontraron tablas.</div>
                ) : (
                  tables.map((t) => {
                    const active = t.nombre === selectedTable;
                    return (
                      <button
                        key={t.nombre}
                        onClick={() => setSelectedTable(t.nombre)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                          active
                            ? "bg-lime-500 text-gray-950 font-semibold shadow-sm"
                            : "text-gray-700 hover:bg-gray-200/60"
                        }`}
                      >
                        <span className="truncate">{t.nombre}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            active ? "bg-black/15 text-gray-900" : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {t.totalFilas}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Main Panel: Registros de la Tabla */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              {/* Table Control Bar */}
              <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">Tabla activa:</span>
                  <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                    {selectedTable || "Ninguna seleccionada"}
                  </span>
                  <span className="text-xs text-gray-400">· {rows.length} registros</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedTable && (
                    <button
                      onClick={handleOpenInsertModal}
                      disabled={loadingColumns}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-lime-400 hover:bg-lime-300 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      title="Insertar un nuevo registro en esta tabla"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      {loadingColumns ? "Cargando..." : "Insertar Fila"}
                    </button>
                  )}
                  <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                        viewMode === "table" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Tabla
                    </button>
                    <button
                      onClick={() => setViewMode("json")}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                        viewMode === "json" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      JSON
                    </button>
                  </div>
                  <CopyBtn text={JSON.stringify(rows, null, 2)} />
                </div>
              </div>

              {/* Table Data View */}
              <div className="flex-1 overflow-auto p-4">
                {loadingRows ? (
                  <div className="h-full flex items-center justify-center text-sm text-gray-400">
                    Consultando base de datos PostgreSQL...
                  </div>
                ) : rows.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">La tabla está vacía</p>
                    <p className="text-xs text-gray-500 mb-4">No hay filas registradas aún en esta tabla.</p>
                    {selectedTable && (
                      <button
                        onClick={handleOpenInsertModal}
                        className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-lime-400 hover:bg-lime-300 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Insertar Primer Registro
                      </button>
                    )}
                  </div>
                ) : viewMode === "json" ? (
                  <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-auto max-h-full">
                    {JSON.stringify(rows, null, 2)}
                  </pre>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold font-mono">
                        <tr>
                          {columns.map((col) => (
                            <th key={col} className="px-3.5 py-2.5 whitespace-nowrap border-r border-gray-200 last:border-r-0">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono text-gray-800">
                        {rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-lime-50/40 transition-colors">
                            {columns.map((col) => {
                              const val = row[col];
                              return (
                                <td
                                  key={col}
                                  className="px-3.5 py-2 whitespace-nowrap border-r border-gray-100 last:border-r-0 text-gray-700"
                                >
                                  {val === null || val === undefined ? (
                                    <span className="text-gray-300 italic">null</span>
                                  ) : typeof val === "boolean" ? (
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                                        val ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {String(val)}
                                    </span>
                                  ) : (
                                    String(val)
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Diagrama de Relaciones y Guía de Inserción */}
        {activeTab === "diagram" && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">
                  Arquitectura Relacional y Flujo de Inserción
                </h3>
                <p className="text-xs text-gray-500">
                  Para mantener la integridad referencial en PostgreSQL, las inserciones deben realizarse respetando el orden de llaves foráneas (`FOREIGN KEY`).
                </p>
              </div>

              {/* Diagrama Visual */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <p className="text-xs font-semibold text-gray-700">Jerarquía del Modelo (Plantilla Cultivos y Parcelas)</p>
                <div className="grid grid-cols-3 gap-4">
                  {/* Nivel 1 */}
                  <div className="border border-lime-300 bg-lime-50/50 rounded-xl p-3.5 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-lime-800 bg-lime-200 px-2 py-0.5 rounded">Nivel 1: Maestras</span>
                    <p className="text-xs font-bold text-gray-800">Tablas Independientes</p>
                    <p className="text-[11px] text-gray-600">Se crean sin dependencias previas:</p>
                    <ul className="text-xs font-mono text-gray-700 space-y-1 list-disc list-inside">
                      <li>sectores</li>
                      <li>variedades</li>
                      <li>parcelas</li>
                    </ul>
                  </div>

                  {/* Nivel 2 */}
                  <div className="border border-emerald-300 bg-emerald-50/50 rounded-xl p-3.5 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded">Nivel 2: Central</span>
                    <p className="text-xs font-bold text-gray-800">Núcleo Productivo</p>
                    <p className="text-[11px] text-gray-600">Requiere Parcela y Variedad:</p>
                    <ul className="text-xs font-mono text-gray-700 space-y-1 list-disc list-inside">
                      <li>cultivos <span className="text-[10px] text-gray-400">(FK parcela_id, FK variedad_id)</span></li>
                      <li>suelos <span className="text-[10px] text-gray-400">(FK parcela_id)</span></li>
                      <li>bitacora <span className="text-[10px] text-gray-400">(FK parcela_id)</span></li>
                    </ul>
                  </div>

                  {/* Nivel 3 */}
                  <div className="border border-sky-300 bg-sky-50/50 rounded-xl p-3.5 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-sky-800 bg-sky-200 px-2 py-0.5 rounded">Nivel 3: Operación</span>
                    <p className="text-xs font-bold text-gray-800">Detalle Operativo</p>
                    <p className="text-[11px] text-gray-600">Requieren un Cultivo activo:</p>
                    <ul className="text-xs font-mono text-gray-700 space-y-1 list-disc list-inside">
                      <li>siembras <span className="text-[10px] text-gray-400">(FK cultivo_id)</span></li>
                      <li>cosechas <span className="text-[10px] text-gray-400">(FK cultivo_id)</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Guía de Inserción Paso a Paso */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                <p className="text-xs font-semibold text-gray-700">Secuencia de Inserción Recomendada</p>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                    <div>
                      <strong className="text-gray-900">Crear Parcelas y Variedades:</strong> Son las entidades base. Por ejemplo: crear el lote *"Lote Los Pinos"* y la variedad *"Café Geisha"*.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                    <div>
                      <strong className="text-gray-900">Crear el Cultivo:</strong> Conecta el ID de la Parcela con el ID de la Variedad, estableciendo la fecha estimada de floración o cosecha.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                    <div>
                      <strong className="text-gray-900">Registrar Siembras y Cosechas:</strong> Se asocian al ID del Cultivo generado en el paso anterior para computar rendimiento y costos.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Acceso directo para aplicaciones externas disponible vía PostgreSQL JDBC o API REST</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors text-xs"
          >
            Cerrar Visor
          </button>
        </div>
      </div>

      {/* Modal: Crear Nueva Tabla */}
      {showCreateTableModal && (
        <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-gray-900">Crear Nueva Tabla en la Instancia</h3>
              <button onClick={() => setShowCreateTableModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">×</button>
            </div>

            <form onSubmit={handleCreateTableSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre de la Tabla</label>
                <input
                  type="text"
                  required
                  placeholder="ej. trabajadores, inventario_abonos"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-lime-400 focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">Se creará con un identificador `id SERIAL PRIMARY KEY` automáticamente.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-700">Columnas Adicionales</label>
                  <button
                    type="button"
                    onClick={handleAddColumn}
                    className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
                  >
                    + Agregar Columna
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {columnsList.map((col, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 text-xs">
                      <input
                        type="text"
                        placeholder="Nombre col"
                        value={col.name}
                        onChange={(e) => handleColumnChange(idx, "name", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                        className="flex-1 border border-gray-200 rounded px-2 py-1 font-mono text-xs"
                      />
                      <select
                        value={col.type}
                        onChange={(e) => handleColumnChange(idx, "type", e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 bg-white text-xs font-mono"
                      >
                        <option value="VARCHAR">VARCHAR</option>
                        <option value="TEXT">TEXT</option>
                        <option value="INTEGER">INTEGER</option>
                        <option value="NUMERIC">NUMERIC</option>
                        <option value="BOOLEAN">BOOLEAN</option>
                        <option value="DATE">DATE</option>
                        <option value="TIMESTAMP">TIMESTAMP</option>
                      </select>
                      {columnsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColumn(idx)}
                          className="text-red-500 hover:text-red-700 px-1 font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateTableModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingTable}
                  className="px-4 py-2 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-slate-900 font-semibold rounded-lg text-xs transition-colors"
                >
                  {creatingTable ? "Creando en PostgreSQL..." : "Crear Tabla en BD"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Insertar Nueva Fila */}
      {showInsertRowModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 border border-gray-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-lime-100 text-lime-800 flex items-center justify-center font-bold text-xs">
                  +
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Insertar Registro en '{selectedTable}'</h3>
                  <p className="text-[11px] text-gray-500">Los valores serán persistidos inmediatamente en PostgreSQL.</p>
                </div>
              </div>
              <button
                onClick={() => setShowInsertRowModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInsertRowSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto pr-1 space-y-3.5">
                {tableColumns
                  .filter((col) => col.column_name.toLowerCase() !== "id")
                  .map((col) => {
                    const colName = col.column_name;
                    const type = col.data_type.toLowerCase();
                    const isRequired = col.is_nullable === "NO" && !col.column_default;
                    const isNumber =
                      type.includes("int") ||
                      type.includes("serial") ||
                      type.includes("numeric") ||
                      type.includes("float") ||
                      type.includes("double") ||
                      type.includes("real");
                    const isBool = type.includes("bool");
                    const isDate = type.includes("date") && !type.includes("time");
                    const isDateTime = type.includes("time");

                    return (
                      <div key={colName} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-mono font-medium text-gray-800 flex items-center gap-1">
                            {colName}
                            {isRequired ? (
                              <span className="text-red-500 font-bold" title="Requerido">*</span>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-sans font-normal">(opcional)</span>
                            )}
                          </label>
                          <span className="text-[10px] font-mono text-gray-400 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
                            {col.data_type}
                          </span>
                        </div>

                        {isBool ? (
                          <select
                            value={newRowData[colName] ?? ""}
                            onChange={(e) =>
                              setNewRowData((prev) => ({
                                ...prev,
                                [colName]: e.target.value === "true" ? true : e.target.value === "false" ? false : "",
                              }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono bg-white focus:ring-2 focus:ring-lime-400 focus:outline-none"
                          >
                            <option value="">(Sin definir / Default)</option>
                            <option value="true">true (Verdadero)</option>
                            <option value="false">false (Falso)</option>
                          </select>
                        ) : type.includes("text") ? (
                          <textarea
                            rows={2}
                            required={isRequired}
                            placeholder={`Ingresa ${colName}...`}
                            value={newRowData[colName] || ""}
                            onChange={(e) =>
                              setNewRowData((prev) => ({
                                ...prev,
                                [colName]: e.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-lime-400 focus:outline-none"
                          />
                        ) : (
                          <input
                            type={isNumber ? "number" : isDate ? "date" : isDateTime ? "datetime-local" : "text"}
                            step={isNumber ? "any" : undefined}
                            required={isRequired}
                            placeholder={`Valor para ${colName}...`}
                            value={newRowData[colName] ?? ""}
                            onChange={(e) =>
                              setNewRowData((prev) => ({
                                ...prev,
                                [colName]: e.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-lime-400 focus:outline-none"
                          />
                        )}
                        {col.column_default && (
                          <p className="text-[10px] text-gray-400">
                            Por defecto: <code className="text-gray-600">{col.column_default}</code>
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="flex justify-end gap-2 pt-4 mt-3 border-t border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowInsertRowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={insertingRow}
                  className="px-4 py-2 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-slate-900 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {insertingRow ? "Guardando en BD..." : "Guardar Registro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
