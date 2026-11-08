import { useState } from "react";
import { INITIAL_DOCS, type DocItem } from "../../data/shared";
import { CustomSelect } from "../ui/CustomSelect";

interface SharedDocumentationProps {
  userRole?: "admin" | "cliente" | "soporte";
  isDark?: boolean;
}

export function SharedDocumentation({ userRole = "cliente", isDark = false }: SharedDocumentationProps) {
  const [docsList, setDocsList] = useState<DocItem[]>(INITIAL_DOCS);
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [modalTab, setModalTab] = useState<"visor" | "resumen">("visor");
  const [destinationFilter, setDestinationFilter] = useState<"todos" | "cliente" | "soporte">("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for admin upload
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<DocItem["categoria"]>("Manuales");
  const [destination, setDestination] = useState<"cliente" | "soporte" | "todos">("todos");
  const [content, setContent] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);

  const isAdmin = userRole === "admin";

  // Filter documents based on role and filter tab
  const visibleDocs = docsList.filter((doc) => {
    if (isAdmin) {
      if (destinationFilter === "todos") return true;
      return doc.destino === destinationFilter || doc.destino === "todos";
    }
    // Non-admin can see documents for their role or "todos"
    return doc.destino === userRole || doc.destino === "todos";
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newDoc: DocItem = {
      id: `DOC-00${docsList.length + 1}`,
      titulo: title,
      descripcion: description,
      categoria: category,
      destino: destination,
      archivoNombre: fileInput ? fileInput.name : `${title.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      archivoTamano: fileInput ? `${(fileInput.size / (1024 * 1024)).toFixed(1)} MB` : "1.5 MB",
      archivoUrl: fileInput ? URL.createObjectURL(fileInput) : "/documentation/AgroCloud_Manual_Tecnico.pdf",
      contenido: content.trim() || "Este documento fue cargado por el Administrador de AgroCloud.",
      fecha: new Date().toISOString().split("T")[0],
      autor: "David Admin",
    };

    setDocsList([newDoc, ...docsList]);
    setIsModalOpen(false);

    // Reset form
    setTitle("");
    setDescription("");
    setCategory("Manuales");
    setDestination("todos");
    setContent("");
    setFileInput(null);
  };

  const handleOpenDoc = (doc: DocItem, tab: "visor" | "resumen" = "visor") => {
    setSelectedDoc(doc);
    setModalTab(tab);
  };

  return (
    <div className={`flex-1 overflow-auto p-4 lg:p-8 font-[Inter,sans-serif] ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Centro de Documentación</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
            {isAdmin
              ? "Gestiona, publica y distribuye manuales oficiales y guías técnicas para Clientes o Soporte."
              : `Manuales oficiales y guías técnicas asignadas para ${userRole === "soporte" ? "el equipo de Soporte" : "Clientes y Productores"}.`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm self-start md:self-auto cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Subir Documento
            </button>
          )}
        </div>
      </div>

      {/* Admin Filters */}
      {isAdmin && (
        <div className={`flex items-center gap-2 mb-6 border-b pb-3 ${isDark ? "border-slate-800" : "border-gray-200"}`}>
          <span className={`text-xs font-semibold uppercase tracking-wider mr-2 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Filtrar por Destino:</span>
          {(["todos", "cliente", "soporte"] as const).map((dest) => (
            <button
              key={dest}
              onClick={() => setDestinationFilter(dest)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                destinationFilter === dest
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        {visibleDocs.map((doc) => (
          <div
            key={doc.id}
            className={`border rounded-2xl p-6 flex flex-col justify-between transition-all group shadow-xs ${
              isDark
                ? "bg-slate-900 border-slate-800 hover:border-lime-500/50"
                : "bg-white border-gray-200 hover:border-lime-400 hover:shadow-md"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                    isDark ? "bg-lime-950/60 text-lime-400 border border-lime-800/40" : "bg-lime-50 text-lime-800 border border-lime-200"
                  }`}>
                    {doc.categoria}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isDark ? "bg-red-950/50 text-red-400 border border-red-800/40" : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    PDF · {doc.archivoTamano}
                  </span>
                </div>
                {isAdmin && (
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      doc.destino === "soporte"
                        ? isDark ? "bg-purple-950/50 text-purple-300 border border-purple-800/40" : "bg-purple-100 text-purple-700 border border-purple-200"
                        : doc.destino === "cliente"
                        ? isDark ? "bg-blue-950/50 text-blue-300 border border-blue-800/40" : "bg-blue-100 text-blue-700 border border-blue-200"
                        : isDark ? "bg-emerald-950/50 text-emerald-300 border border-emerald-800/40" : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {doc.destino === "soporte" ? "Soporte" : doc.destino === "cliente" ? "Cliente" : "General"}
                  </span>
                )}
              </div>

              <h2 className={`font-bold text-lg mb-2 transition-colors ${
                isDark ? "text-white group-hover:text-lime-400" : "text-gray-900 group-hover:text-lime-700"
              }`}>
                {doc.titulo}
              </h2>
              <p className={`text-xs leading-relaxed line-clamp-3 mb-5 ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                {doc.descripcion}
              </p>
            </div>

            <div className={`pt-4 border-t flex flex-wrap items-center justify-between gap-3 ${isDark ? "border-slate-800" : "border-gray-100"}`}>
              <div className={`flex items-center gap-2 text-xs truncate ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="truncate max-w-[150px] font-mono text-[11px]" title={doc.archivoNombre}>{doc.archivoNombre}</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={doc.archivoUrl}
                  download={doc.archivoNombre}
                  title="Descargar PDF"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Descargar</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleOpenDoc(doc, "visor")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isDark
                      ? "text-lime-400 bg-lime-950/40 hover:bg-lime-900/50 border border-lime-800/40"
                      : "text-lime-800 hover:text-lime-900 bg-lime-100 hover:bg-lime-200 border border-lime-300"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Ver en línea</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleDocs.length === 0 && (
        <div className={`border rounded-2xl p-12 text-center ${isDark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-gray-200 text-gray-500"}`}>
          <p className="text-sm">No hay documentos disponibles en esta categoría.</p>
        </div>
      )}

      {/* Document Viewer Modal with Integrated PDF Viewer and Content Tab */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 animate-in fade-in">
          <div className={`rounded-2xl max-w-5xl w-full p-5 lg:p-6 shadow-2xl flex flex-col max-h-[92vh] border animate-in zoom-in-95 duration-150 ${
            isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-gray-100 text-gray-900"
          }`}>
            {/* Modal Header */}
            <div className={`flex items-start justify-between border-b pb-4 mb-4 ${isDark ? "border-slate-800" : "border-gray-200"}`}>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isDark ? "bg-lime-950/60 text-lime-400 border border-lime-800/40" : "bg-lime-100 text-lime-800"
                  }`}>
                    {selectedDoc.categoria}
                  </span>
                  <span className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    Destino: <strong className={`capitalize ${isDark ? "text-slate-200" : "text-gray-700"}`}>{selectedDoc.destino}</strong>
                  </span>
                  <span className={`text-xs ${isDark ? "text-slate-400" : "text-gray-400"}`}>·</span>
                  <span className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-gray-500"}`}>{selectedDoc.archivoTamano}</span>
                </div>
                <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{selectedDoc.titulo}</h2>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors text-lg cursor-pointer ${
                  isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
                title="Cerrar visor"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs inside modal */}
            <div className="flex items-center gap-2 mb-4 border-b pb-2 text-xs font-medium border-gray-200 dark:border-slate-800">
              <button
                onClick={() => setModalTab("visor")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  modalTab === "visor"
                    ? "bg-lime-400 text-gray-900 font-bold"
                    : isDark ? "text-slate-300 hover:bg-slate-800" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Visor PDF Interactivo
              </button>
              <button
                onClick={() => setModalTab("resumen")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  modalTab === "resumen"
                    ? "bg-lime-400 text-gray-900 font-bold"
                    : isDark ? "text-slate-300 hover:bg-slate-800" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Resumen y Estructura
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto pr-1">
              {modalTab === "visor" ? (
                <div className="w-full h-[62vh] rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex flex-col">
                  <iframe
                    src={`${selectedDoc.archivoUrl}#toolbar=1&navpanes=0`}
                    className="w-full flex-1 border-0"
                    title={selectedDoc.titulo}
                  />
                </div>
              ) : (
                <div className="space-y-4 text-sm leading-relaxed">
                  <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-gray-50 border-gray-100"}`}>
                    <p className={`font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Descripción del documento</p>
                    <p className={isDark ? "text-slate-300" : "text-gray-600"}>{selectedDoc.descripcion}</p>
                  </div>

                  <div>
                    <h3 className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Índice y Contenido Oficial:</h3>
                    <div className={`p-4 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap border ${
                      isDark ? "bg-slate-950 text-slate-200 border-slate-800" : "bg-slate-900 text-slate-100 border-slate-800"
                    }`}>
                      {selectedDoc.contenido}
                    </div>
                  </div>

                  <div className={`flex items-center justify-between text-xs pt-2 border-t ${isDark ? "text-slate-400 border-slate-800" : "text-gray-500 border-gray-100"}`}>
                    <span>Archivo: <strong className={isDark ? "text-slate-200" : "text-gray-700"}>{selectedDoc.archivoNombre}</strong> ({selectedDoc.archivoTamano})</span>
                    <span>Publicado el: {selectedDoc.fecha} por {selectedDoc.autor}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`border-t pt-4 mt-4 flex flex-wrap items-center justify-between gap-3 ${isDark ? "border-slate-800" : "border-gray-100"}`}>
              <div className="flex items-center gap-2">
                <a
                  href={selectedDoc.archivoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Abrir en pestaña nueva</span>
                </a>

                <a
                  href={selectedDoc.archivoUrl}
                  download={selectedDoc.archivoNombre}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Descargar archivo</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                Cerrar
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
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${
                    isDark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>Categoría</label>
                  <CustomSelect<DocItem["categoria"]>
                    value={category}
                    onChange={(val) => setCategory(val)}
                    options={[
                      { value: "Manuales", label: "Manuales" },
                      { value: "General", label: "General" },
                      { value: "Conexiones", label: "Conexiones" },
                      { value: "Plantillas", label: "Plantillas" },
                      { value: "Seguridad", label: "Seguridad" },
                    ]}
                    isDark={isDark}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>Destinado a:</label>
                  <CustomSelect<"cliente" | "soporte" | "todos">
                    value={destination}
                    onChange={(val) => setDestination(val)}
                    options={[
                      { value: "todos", label: "Todos (Clientes y Soporte)" },
                      { value: "cliente", label: "Solo Clientes" },
                      { value: "soporte", label: "Solo Soporte" },
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
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
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
                  className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                    isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-gray-900 text-sm font-semibold transition-colors cursor-pointer"
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
