import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  FaUserPlus,
  FaUserShield,
  FaUserMd,
  FaConciergeBell,
  FaSearch,
  FaTrash,
  FaTimes,
  FaLock,
} from "react-icons/fa";

interface Personal {
  id_usuario: string;
  nombre: string;
  apellidos: string;
  telefono?: string | null;
  correo: string;
  direccion?: string | null;
  especializacion?: string | null;
  rol: "admin" | "especialista" | "recepcionista";
  citas_asociadas: number;
  puede_eliminar: boolean;
}

const ROL_LABEL = {
  especialista: "Especialista",
  recepcionista: "Recepcionista",
  admin: "Administrador",
};

const ROL_ICON = {
  especialista: <FaUserMd />,
  recepcionista: <FaConciergeBell />,
  admin: <FaUserShield />,
};

// Roles que la API permite crear desde el panel de administración
const ROLES_REGISTRO = ["especialista", "recepcionista", "admin"];

const FILTROS = ["todos", "especialista", "recepcionista", "admin"];
const FILTRO_LABEL = {
  todos: "Todos",
  especialista: "Especialistas",
  recepcionista: "Recepcionistas",
  admin: "Administradores",
};

const FORM_INICIAL = {
  rol: "especialista",
  nombre: "",
  apellidos: "",
  telefono: "",
  correo: "",
  direccion: "",
  especializacion: "",
  contrasena: "",
  confirmar: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function iniciales(nombre = "", apellidos = "") {
  return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase() || "?";
}

function GestionUsuarios() {
  const { usuario } = useAuth();

  const [personal, setPersonal] = useState<Personal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorLista, setErrorLista] = useState("");
  const [aviso, setAviso] = useState("");

  // Formulario
  const [form, setForm] = useState(FORM_INICIAL);
  const [errorForm, setErrorForm] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Lista
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setErrorLista("");
    try {
      const respuesta = await api.get("/usuarios/personal");
      setPersonal(respuesta.data.data || []);
    } catch (err) {
      setErrorLista(
        err.response?.data?.message ||
          "No se pudo cargar el personal. Verifica que el backend esté activo."
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const conteo = useMemo(() => {
    const base = { todos: personal.length, especialista: 0, recepcionista: 0, admin: 0 };
    personal.forEach((p) => {
      base[p.rol] += 1;
    });
    return base;
  }, [personal]);

  const visibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return personal.filter((p) => {
      if (filtro !== "todos" && p.rol !== filtro) return false;
      if (!termino) return true;
      return `${p.nombre} ${p.apellidos} ${p.correo} ${p.especializacion || ""} ${p.id_usuario}`
        .toLowerCase()
        .includes(termino);
    });
  }, [personal, filtro, busqueda]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validar = () => {
    if (!form.nombre.trim() || !form.apellidos.trim()) return "Ingresa nombre y apellidos.";
    if (!form.telefono.trim()) return "Ingresa el teléfono.";
    if (!EMAIL_REGEX.test(form.correo.trim())) return "Ingresa un correo electrónico válido.";
    if (!form.direccion.trim()) return "Ingresa la dirección.";
    if (form.rol === "especialista" && !form.especializacion.trim()) {
      return "La especialización es obligatoria para especialistas.";
    }
    if (form.contrasena.length < 4) return "La contraseña debe tener al menos 4 caracteres.";
    if (form.contrasena !== form.confirmar) return "Las contraseñas no coinciden.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAviso("");

    const problema = validar();
    if (problema) {
      setErrorForm(problema);
      return;
    }

    setErrorForm("");
    setEnviando(true);

    // La API no admite "especializacion" para roles distintos de especialista
    const cuerpo: Record<string, string> = {
      nombre: form.nombre.trim(),
      apellidos: form.apellidos.trim(),
      telefono: form.telefono.trim(),
      correo: form.correo.trim(),
      direccion: form.direccion.trim(),
      contrasena: form.contrasena,
      rol: form.rol,
    };
    if (form.rol === "especialista") cuerpo.especializacion = form.especializacion.trim();

    try {
      // Importante: la respuesta incluye un token de la cuenta NUEVA; se ignora a propósito
      // para no cambiar la sesión del administrador.
      const respuesta = await api.post("/auth/registro-admin", cuerpo);
      const creado = respuesta.data.data?.usuario;

      setAviso(
        `${ROL_LABEL[form.rol]} creado: ${creado?.nombre} ${creado?.apellidos} (ID ${creado?.id_usuario}).`
      );
      setForm({ ...FORM_INICIAL, rol: form.rol });
      await cargar();
    } catch (err) {
      setErrorForm(err.response?.data?.message || "No se pudo crear la cuenta.");
    } finally {
      setEnviando(false);
    }
  };

  const eliminar = async (persona: Personal) => {
    setEliminandoId(persona.id_usuario);
    setErrorLista("");
    setAviso("");
    try {
      await api.delete(`/usuarios/${persona.id_usuario}`);
      setPersonal((prev) => prev.filter((p) => p.id_usuario !== persona.id_usuario));
      setConfirmandoId(null);
      setAviso(`Se eliminó la cuenta de ${persona.nombre} ${persona.apellidos}.`);
    } catch (err) {
      setErrorLista(err.response?.data?.message || "No se pudo eliminar la cuenta.");
      setConfirmandoId(null);
      // Puede haber cambiado (p. ej. se le asignó una cita): refresca los datos
      cargar();
    } finally {
      setEliminandoId(null);
    }
  };

  const nota = (p: Personal) => {
    if (p.rol === "admin") return "Cuenta protegida: no se puede eliminar";
    if (p.citas_asociadas > 0) {
      return `${p.citas_asociadas} ${p.citas_asociadas === 1 ? "cita asociada" : "citas asociadas"} · no se puede eliminar`;
    }
    return "";
  };

  return (
    <div className="container">
      <div className="dash-header">
        <div>
          <h1>Gestión de personal</h1>
          <p>Registra especialistas, recepcionistas y administradores, y elimina las cuentas que ya no se usan.</p>
        </div>
      </div>

      {aviso && <p className="message message-success">{aviso}</p>}

      <div className="users-layout">
        {/* ---------- Registro ---------- */}
        <aside className="panel users-form">
          <div className="panel__head">
            <h2>
              <FaUserPlus /> Registrar nuevo usuario
            </h2>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label>Tipo de cuenta</label>
              <div className="role-picker" role="group" aria-label="Tipo de cuenta">
                {ROLES_REGISTRO.map((rol) => (
                  <button
                    type="button"
                    key={rol}
                    className={`chip ${form.rol === rol ? "chip--active" : ""}`}
                    onClick={() => setForm({ ...form, rol, especializacion: "" })}
                  >
                    {ROL_ICON[rol]} {ROL_LABEL[rol]}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="nombre">Nombre</label>
                <input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} maxLength={100} />
              </div>
              <div className="field">
                <label htmlFor="apellidos">Apellidos</label>
                <input
                  id="apellidos"
                  name="apellidos"
                  value={form.apellidos}
                  onChange={handleChange}
                  maxLength={150}
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="telefono">Teléfono</label>
                <input id="telefono" name="telefono" value={form.telefono} onChange={handleChange} maxLength={20} />
              </div>
              <div className="field">
                <label htmlFor="correo">Correo</label>
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  value={form.correo}
                  onChange={handleChange}
                  maxLength={150}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="direccion">Dirección</label>
              <input id="direccion" name="direccion" value={form.direccion} onChange={handleChange} maxLength={150} />
            </div>

            {form.rol === "especialista" && (
              <div className="field">
                <label htmlFor="especializacion">Especialización</label>
                <input
                  id="especializacion"
                  name="especializacion"
                  value={form.especializacion}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Ej. Medicina felina"
                />
              </div>
            )}

            <div className="field-row">
              <div className="field">
                <label htmlFor="contrasena">Contraseña</label>
                <input
                  id="contrasena"
                  name="contrasena"
                  type="password"
                  autoComplete="new-password"
                  value={form.contrasena}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="confirmar">Confirmar contraseña</label>
                <input
                  id="confirmar"
                  name="confirmar"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmar}
                  onChange={handleChange}
                />
              </div>
            </div>

            {errorForm && <p className="message message-error">{errorForm}</p>}

            <button className="btn btn-primary btn-block" disabled={enviando}>
              <FaUserPlus /> {enviando ? "Creando..." : `Crear ${ROL_LABEL[form.rol].toLowerCase()}`}
            </button>
          </form>
        </aside>

        {/* ---------- Personal registrado ---------- */}
        <section className="panel users-list">
          <div className="panel__head">
            <h2>Personal registrado</h2>
          </div>

          {errorLista && <p className="message message-error">{errorLista}</p>}

          <div className="avail-search">
            <FaSearch />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, ID o especialización..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar personal"
            />
          </div>

          <div className="cita-filters__estados" role="group" aria-label="Filtrar por tipo de cuenta">
            {FILTROS.map((f) => (
              <button
                type="button"
                key={f}
                className={`chip ${filtro === f ? "chip--active" : ""}`}
                onClick={() => setFiltro(f)}
              >
                {FILTRO_LABEL[f]} <span className="chip__count">{conteo[f]}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            {cargando ? (
              <p className="empty-state">Cargando personal...</p>
            ) : visibles.length === 0 ? (
              <p className="empty-state">No hay cuentas que coincidan con la búsqueda.</p>
            ) : (
              visibles.map((p) => (
                <div className="list-item staff-row" key={p.id_usuario}>
                  <div className="doctor-card__avatar">{iniciales(p.nombre, p.apellidos)}</div>

                  <div className="list-item__body">
                    <div className="list-item__title">
                      {p.nombre} {p.apellidos}
                      {p.id_usuario === usuario?.id_usuario && <span className="staff-you">Tú</span>}
                    </div>
                    <div className="list-item__meta">
                      {p.correo}
                      {p.telefono ? ` · ${p.telefono}` : ""} · ID {p.id_usuario}
                    </div>
                    {p.especializacion && <div className="list-item__meta">{p.especializacion}</div>}

                    {nota(p) && (
                      <div className="staff-note">
                        <FaLock /> {nota(p)}
                      </div>
                    )}

                    {confirmandoId === p.id_usuario && (
                      <div className="cancel-confirm">
                        <p>
                          ¿Eliminar la cuenta de {p.nombre} {p.apellidos}? Esta acción no se puede deshacer.
                        </p>
                        {p.rol === "especialista" && (
                          <span className="staff-note">También se eliminarán sus horarios libres.</span>
                        )}
                        <div className="cita-actions">
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            disabled={eliminandoId === p.id_usuario}
                            onClick={() => eliminar(p)}
                          >
                            <FaTrash /> {eliminandoId === p.id_usuario ? "Eliminando..." : "Sí, eliminar"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={eliminandoId === p.id_usuario}
                            onClick={() => setConfirmandoId(null)}
                          >
                            <FaTimes /> Volver
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="list-item__side">
                    <span className={`badge badge-rol badge-rol--${p.rol}`}>{ROL_LABEL[p.rol]}</span>
                    {p.puede_eliminar && confirmandoId !== p.id_usuario && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => setConfirmandoId(p.id_usuario)}
                      >
                        <FaTrash /> Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default GestionUsuarios;
