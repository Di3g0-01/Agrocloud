import { useState } from "react";
import { INITIAL_DOCS, type Documento } from "../../data/shared";
import { CustomSelect } from "../ui/CustomSelect";

interface SharedDocumentacionProps {
  userRole?: "admin" | "cliente" | "soporte";
  isDark?: boolean;
}

export function SharedDocumentacion({ userRole = "cliente", isDark = false }: SharedDocumentacionProps) {
  const [docsList, setDocsList] = useState<Documento[]>(INITIAL_DOCS);
  const [selectedDoc, setSelectedDoc] = useState<Documento | null>(null);
  const [filterDestino, setFilterDestino] = useState<"todos" | "cliente" | "soporte">("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for admin upload
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState<Documento["categoria"]>("General");
  const [destino, setDestino] = useState<"cliente" | "soporte">("cliente");
  const [contenido, setContenido] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);

  const isAdmin = userRole === "admin";

  // Filter documents based on role and filter tab
  const visibleDocs = docsList.filter((doc) => {
    if (isAdmin) {
      if (filterDestino === "todos") return true;
      return doc.destino === filterDestino;
    }
    // Non-admin can only see documents matching their specific role
    return doc.destino === userRole;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descripcion.trim()) return;

    const newDoc: Documento = {
      id: `DOC-00${docsList.length + 1}`,
      titulo,
      descripcion,
      categoria,
      destino,
      archivoNombre: fileInput ? fileInput.name : `${titulo.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      archivoTamano: fileInput ? `${(fileInput.size / (1024 * 1024)).toFixed(1)} MB` : "1.5 MB",
      contenido: contenido.trim() || "Este documento fue cargado por el Administrador de AgroCloud.",
      fecha: new Date().toISOString().split("T")[0],
      autor: "David Admin",
    };

    setDocsList([newDoc, ...docsList]);
    setIsModalOpen(false);

    // Reset form
    setTitulo("");
    setDescripcion("");
    setCategoria("General");
    setDestino("cliente");
    setContenido("");
    setFileInput(null);
  };

  return (
    <div className={`flex-1 overflow-auto p-4 lg:p-8 font-[Inter,sans-serif] ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Centro de Documentación</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
            {isAdmin
              ? "Gestiona, publica y distribuye manuales y guías técnicas para Clientes o Soporte."
              : `Guías oficiales y documentación técnica asignada para ${userRole === "soporte" ? "el equipo de Soporte" : "Clientes"}.`}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm self-start md:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Subir Documento
          </button>
        )}
      </div>

      {/* Admin Filters */}
      {isAdmin && (
        <div className={`flex items-center gap-2 mb-6 border-b pb-3 ${isDark ? "border-slate-800" : "border-gray-200"}`}>
          <span className={`text-xs font-semibold uppercase tracking-wider mr-2 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Filtrar por Destino:</span>
          {(["todos", "cliente", "soporte"] as const).map((dest) => (
            <button
              key={dest}
              onClick={() => setFilterDestino(dest)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filterDestino === dest
                  ? "bg-lime-400 text-gray-900 font-semibold"
                  : isDark
                  ? "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {dest === "todos" ? "Todos los documentos" : dest === "cliente" ? "Para Clientes" : "Para Soporte"}
            </button>
          ))}
        </div>
      )}

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {visibleDocs.map((doc) => (
          <div
            key={doc.id}
            className={`border rounded-2xl p-5 flex flex-col justify-between transition-all group ${
              isDark
                ? "bg-slate-900 border-slate-800 hover:border-lime-500/50"
                : "bg-white border-gray-200 hover:border-lime-400 hover:shadow-md"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                  isDark ? "bg-slate-800 text-slate-300 border border-slate-700" : "bg-gray-100 text-gray-700"
                }`}>
                  {doc.categoria}
                </span>
                {isAdmin && (
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      doc.destino === "soporte"
                        ? isDark ? "bg-purple-950/50 text-purple-300 border border-purple-800/40" : "bg-purple-100 text-purple-700 border border-purple-200"
                        : isDark ? "bg-blue-950/50 text-blue-300 border border-blue-800/40" : "bg-blue-100 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {doc.destino === "soporte" ? "Soporte" : "Cliente"}
                  </span>
                )}
              </div>

              <h3 className={`font-bold text-base mb-2 transition-colors ${
                isDark ? "text-white group-hover:text-lime-400" : "text-gray-900 group-hover:text-lime-700"
              }`}>
                {doc.titulo}
              </h3>
              <p className={`text-xs leading-relaxed line-clamp-3 mb-4 ${isDark ? "text-slate-400" : "text-gray-500"}`}>{doc.descripcion}</p>
            </div>

            <div className={`pt-4 border-t flex items-center justify-between ${isDark ? "border-slate-800" : "border-gray-100"}`}>
              <div className={`flex items-center gap-1.5 text-xs ${isDark ? "text-slate-400" : "text-gray-400"}`}>
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span className="truncate max-w-[120px]">{doc.archivoNombre}</span>
              </div>
              <button
                onClick={() => setSelectedDoc(doc)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  isDark
                    ? "text-lime-400 bg-lime-950/40 hover:bg-lime-900/50 border border-lime-800/40"
                    : "text-lime-700 hover:text-lime-800 bg-lime-50 hover:bg-lime-100"
                }`}
              >
                Ver documento
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {visibleDocs.length === 0 && (
        <div className={`border rounded-2xl p-12 text-center ${isDark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-gray-200 text-gray-500"}`}>
          <p className="text-sm">No hay documentos disponibles en esta categoría.</p>
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh] border animate-in fade-in zoom-in duration-150 ${
            isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-gray-100 text-gray-900"
          }`}>
            <div className={`flex items-start justify-between border-b pb-4 mb-4 ${isDark ? "border-slate-800" : "border-gray-100"}`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isDark ? "bg-lime-950/60 text-lime-400 border border-lime-800/40" : "bg-lime-100 text-lime-800"
                  }`}>
                    {selectedDoc.categoria}
                  </span>
                  <span className={`text-xs ${isDark ? "text-slate-400" : "text-gray-400"}`}>Destino: <strong className={`capitalize ${isDark ? "text-slate-200" : "text-gray-700"}`}>{selectedDoc.destino}</strong></span>
                </div>
                <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{selectedDoc.titulo}</h2>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-lg ${
                  isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-sm leading-relaxed">
              <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-gray-50 border-gray-100"}`}>
                <p className={`font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Descripción corta</p>
                <p className={isDark ? "text-slate-300" : "text-gray-600"}>{selectedDoc.descripcion}</p>
              </div>

              <div>
                <h4 className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Contenido oficial del documento:</h4>
                <div className={`p-4 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap border ${
                  isDark ? "bg-slate-950 text-slate-200 border-slate-800" : "bg-slate-900 text-slate-100 border-slate-800"
                }`}>
                  {selectedDoc.contenido}
                </div>
              </div>

              <div className={`flex items-center justify-between text-xs pt-2 border-t ${isDark ? "text-slate-400 border-slate-800" : "text-gray-400 border-gray-100"}`}>
                <span>Archivo: <strong className={isDark ? "text-slate-200" : "text-gray-600"}>{selectedDoc.archivoNombre}</strong> ({selectedDoc.archivoTamano})</span>
                <span>Publicado el: {selectedDoc.fecha} por {selectedDoc.autor}</span>
              </div>
            </div>

            <div className={`border-t pt-4 mt-4 flex items-center justify-end gap-3 ${isDark ? "border-slate-800" : "border-gray-100"}`}>
              <button
                onClick={() => setSelectedDoc(null)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                Cerrar vista previa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-lg w-full p-6 shadow-2xl border animate-in fade-in zoom-in duration-150 ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-gray-100 text-gray-900"
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 mb-4 ${isDark ? "border-slate-800" : "border-gray-100"}`}>
              <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Subir Nueva Documentación</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>Título del documento</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Guía de Restauración de Backups PostgreSQL"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${
                    isDark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>Descripción breve</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Resumen del contenido y propósito de este documento"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${
                    isDark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>Categoría</label>
                  <CustomSelect<Documento["categoria"]>
                    value={categoria}
                    onChange={(val) => setCategoria(val)}
                    options={[
                      { value: "General", label: "General" },
                      { value: "Conexiones", label: "Conexiones" },
                      { value: "Plantillas", label: "Plantillas" },
                      { value: "Seguridad", label: "Seguridad" },
                      { value: "Manuales", label: "Manuales" },
                    ]}
                    isDark={isDark}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>Destinado a:</label>
                  <CustomSelect<"cliente" | "soporte">
                    value={destino}
                    onChange={(val) => setDestino(val)}
                    options={[
                      { value: "cliente", label: "Cliente" },
                      { value: "soporte", label: "Soporte técnico" },
                    ]}
                    isDark={isDark}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>Contenido / Texto explicativo</label>
                <textarea
                  rows={3}
                  placeholder="Escribe el texto explicativo o instrucciones técnicas aquí..."
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 font-mono text-xs ${
                    isDark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>Adjuntar Archivo (PDF, DOCX, etc.)</label>
                <input
                  type="file"
                  onChange={(e) => setFileInput(e.target.files ? e.target.files[0] : null)}
                  className={`w-full text-xs cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold ${
                    isDark
                      ? "text-slate-400 file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700"
                      : "text-gray-500 file:bg-lime-50 file:text-lime-700 hover:file:bg-lime-100"
                  }`}
                />
              </div>

              <div className={`border-t pt-4 flex items-center justify-end gap-3 ${isDark ? "border-slate-800" : "border-gray-100"}`}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                    isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-gray-900 text-sm font-semibold transition-colors"
                >
                  Publicar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
