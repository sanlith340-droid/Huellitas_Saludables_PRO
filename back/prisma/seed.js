import { prisma } from '../app/config/prisma.js';
import { hashContrasena } from '../app/utils/password.js';

const FECHA_DEMO = '2026-11-27';
const CONTRASENA_DEMO = '123456';

const usuariosDemo = [
  { id_usuario: 'REC001', nombre: 'Laura', apellidos: 'Gomez Rodriguez', telefono: '3001112233', correo: 'laura.gomez@proyectohs.com', direccion: 'Calle 80 # 15-20', especializacion: null, tipo: null, rol: 'recepcionista' },
  { id_usuario: 'REC002', nombre: 'Andrea', apellidos: 'Martinez Lopez', telefono: '3012223344', correo: 'andrea.martinez@proyectohs.com', direccion: 'Carrera 13 # 72-15', especializacion: null, tipo: null, rol: 'recepcionista' },
  { id_usuario: 'REC003', nombre: 'Carlos', apellidos: 'Torres Perez', telefono: '3023334455', correo: 'carlos.torres@proyectohs.com', direccion: 'Calle 100 # 18-30', especializacion: null, tipo: null, rol: 'recepcionista' },
  { id_usuario: 'ADM001', nombre: 'Juan', apellidos: 'Rodriguez Sanchez', telefono: '3104445566', correo: 'juan.rodriguez@proyectohs.com', direccion: 'Carrera 7 # 85-20', especializacion: null, tipo: null, rol: 'admin' },
  { id_usuario: 'USU001', nombre: 'Pedro', apellidos: 'Gonzalez Ramirez', telefono: '3115556677', correo: 'pedro.gonzalez@gmail.com', direccion: 'Calle 45 # 20-10', especializacion: null, tipo: 'principal', rol: 'usuario' },
  { id_usuario: 'USU002', nombre: 'Maria', apellidos: 'Lopez Hernandez', telefono: '3126667788', correo: 'maria.lopez@gmail.com', direccion: 'Carrera 30 # 45-25', especializacion: null, tipo: 'principal', rol: 'usuario' },
  { id_usuario: 'USU003', nombre: 'Andres', apellidos: 'Martinez Castro', telefono: '3137778899', correo: 'andres.martinez@gmail.com', direccion: 'Calle 60 # 25-15', especializacion: null, tipo: 'principal', rol: 'usuario' },
  { id_usuario: 'USU004', nombre: 'Diana', apellidos: 'Perez Moreno', telefono: '3148889900', correo: 'diana.perez@gmail.com', direccion: 'Carrera 50 # 80-20', especializacion: null, tipo: 'principal', rol: 'usuario' },
  { id_usuario: 'USU005', nombre: 'Felipe', apellidos: 'Sanchez Torres', telefono: '3159990011', correo: 'felipe.sanchez@gmail.com', direccion: 'Calle 72 # 40-18', especializacion: null, tipo: 'principal', rol: 'usuario' },
  { id_usuario: 'USU006', nombre: 'Natalia', apellidos: 'Ramirez Vargas', telefono: '3161112233', correo: 'natalia.ramirez@gmail.com', direccion: 'Carrera 19 # 65-30', especializacion: null, tipo: 'principal', rol: 'usuario' },
  { id_usuario: 'USU007', nombre: 'Santiago', apellidos: 'Moreno Diaz', telefono: '3172223344', correo: 'santiago.moreno@gmail.com', direccion: 'Calle 90 # 22-40', especializacion: null, tipo: 'principal', rol: 'usuario' },
  { id_usuario: 'USU008', nombre: 'Camila', apellidos: 'Vargas Ruiz', telefono: '3183334455', correo: 'camila.vargas@gmail.com', direccion: 'Carrera 11 # 60-25', especializacion: null, tipo: 'acudiente', rol: 'usuario' },
  { id_usuario: 'USU009', nombre: 'Ricardo', apellidos: 'Diaz Herrera', telefono: '3194445566', correo: 'ricardo.diaz@gmail.com', direccion: 'Calle 35 # 15-40', especializacion: null, tipo: 'acudiente', rol: 'usuario' },
  { id_usuario: 'USU010', nombre: 'Valentina', apellidos: 'Ruiz Molina', telefono: '3205556677', correo: 'valentina.ruiz@gmail.com', direccion: 'Carrera 40 # 70-10', especializacion: null, tipo: 'acudiente', rol: 'usuario' },
  { id_usuario: 'ESP001', nombre: 'Alejandro', apellidos: 'Castillo Moreno', telefono: '3211112233', correo: 'alejandro.castillo@proyectohs.com', direccion: 'Carrera 15 # 80-25', especializacion: 'Medicina Veterinaria General', tipo: null, rol: 'especialista' },
  { id_usuario: 'ESP002', nombre: 'Carolina', apellidos: 'Mendez Torres', telefono: '3222223344', correo: 'carolina.mendez@proyectohs.com', direccion: 'Calle 90 # 18-35', especializacion: 'Medicina Felina', tipo: null, rol: 'especialista' },
  { id_usuario: 'ESP003', nombre: 'Mauricio', apellidos: 'Rojas Hernandez', telefono: '3233334455', correo: 'mauricio.rojas@proyectohs.com', direccion: 'Carrera 50 # 75-40', especializacion: 'Cirugia Veterinaria', tipo: null, rol: 'especialista' },
];

const razasDemo = [
  'Labrador Retriever', 'Golden Retriever', 'Pastor Alemán', 'Bulldog Francés',
  'Beagle', 'Poodle', 'Chihuahua', 'Husky Siberiano', 'Persa', 'Siamés',
  'Maine Coon', 'Bengalí', 'Angora', 'British Shorthair',
];

const mascotasDemo = [
  { nombre: 'Max', fecha_nacimiento: '2021-03-15', especie: 'perro', genero: 'macho', raza: 'Labrador Retriever' },
  { nombre: 'Luna', fecha_nacimiento: '2022-07-10', especie: 'gato', genero: 'hembra', raza: 'Persa' },
  { nombre: 'Rocky', fecha_nacimiento: '2020-11-05', especie: 'perro', genero: 'macho', raza: 'Pastor Alemán' },
  { nombre: 'Nala', fecha_nacimiento: '2023-01-20', especie: 'gato', genero: 'hembra', raza: 'Siamés' },
  { nombre: 'Bruno', fecha_nacimiento: '2019-08-12', especie: 'perro', genero: 'macho', raza: 'Golden Retriever' },
  { nombre: 'Mia', fecha_nacimiento: '2022-05-18', especie: 'gato', genero: 'hembra', raza: 'Maine Coon' },
  { nombre: 'Toby', fecha_nacimiento: '2021-09-25', especie: 'perro', genero: 'macho', raza: 'Beagle' },
  { nombre: 'Coco', fecha_nacimiento: '2023-04-14', especie: 'gato', genero: 'hembra', raza: 'Bengalí' },
  { nombre: 'Zeus', fecha_nacimiento: '2020-02-28', especie: 'perro', genero: 'macho', raza: 'Husky Siberiano' },
  { nombre: 'Kira', fecha_nacimiento: '2022-12-03', especie: 'perro', genero: 'hembra', raza: 'Bulldog Francés' },
  { nombre: 'Canela', fecha_nacimiento: '2021-06-11', especie: 'perro', genero: 'hembra', raza: 'Poodle' },
  { nombre: 'Milo', fecha_nacimiento: '2023-02-09', especie: 'gato', genero: 'macho', raza: 'Siamés' },
  { nombre: 'Simba', fecha_nacimiento: '2020-10-21', especie: 'gato', genero: 'macho', raza: 'Maine Coon' },
  { nombre: 'Maya', fecha_nacimiento: '2022-04-17', especie: 'perro', genero: 'hembra', raza: 'Beagle' },
  { nombre: 'Thor', fecha_nacimiento: '2019-12-02', especie: 'perro', genero: 'macho', raza: 'Pastor Alemán' },
  { nombre: 'Nina', fecha_nacimiento: '2023-06-25', especie: 'gato', genero: 'hembra', raza: 'British Shorthair' },
  { nombre: 'Oliver', fecha_nacimiento: '2021-11-19', especie: 'gato', genero: 'macho', raza: 'Bengalí' },
  { nombre: 'Kiara', fecha_nacimiento: '2020-08-08', especie: 'perro', genero: 'hembra', raza: 'Golden Retriever' },
  { nombre: 'Bimba', fecha_nacimiento: '2022-09-14', especie: 'perro', genero: 'hembra', raza: 'Chihuahua' },
  { nombre: 'Dante', fecha_nacimiento: '2021-01-30', especie: 'perro', genero: 'macho', raza: 'Bulldog Francés' },
  { nombre: 'Lola', fecha_nacimiento: '2023-03-12', especie: 'gato', genero: 'hembra', raza: 'Angora' },
  { nombre: 'Sam', fecha_nacimiento: '2020-05-26', especie: 'perro', genero: 'macho', raza: 'Husky Siberiano' },
  { nombre: 'Frida', fecha_nacimiento: '2022-01-07', especie: 'perro', genero: 'hembra', raza: 'Labrador Retriever' },
  { nombre: 'Chester', fecha_nacimiento: '2019-10-13', especie: 'gato', genero: 'macho', raza: 'Persa' },
  { nombre: 'Pelusa', fecha_nacimiento: '2023-08-22', especie: 'gato', genero: 'hembra', raza: 'Poodle' },
  { nombre: 'Apolo', fecha_nacimiento: '2021-07-03', especie: 'perro', genero: 'macho', raza: 'Beagle' },
  { nombre: 'Greta', fecha_nacimiento: '2020-03-29', especie: 'perro', genero: 'hembra', raza: 'Poodle' },
  { nombre: 'Jack', fecha_nacimiento: '2022-11-16', especie: 'perro', genero: 'macho', raza: 'Chihuahua' },
  { nombre: 'Bobby', fecha_nacimiento: '2021-04-05', especie: 'perro', genero: 'macho', raza: 'Golden Retriever' },
  { nombre: 'Mona', fecha_nacimiento: '2023-09-18', especie: 'gato', genero: 'hembra', raza: 'British Shorthair' },
];

const relacionesDemo = [
  { id_usuario: 'USU001', mascotas: ['Max', 'Luna', 'Canela'] },
  { id_usuario: 'USU002', mascotas: ['Rocky', 'Milo', 'Simba'] },
  { id_usuario: 'USU003', mascotas: ['Nala', 'Bruno', 'Maya'] },
  { id_usuario: 'USU004', mascotas: ['Mia', 'Thor', 'Nina'] },
  { id_usuario: 'USU005', mascotas: ['Toby', 'Coco', 'Oliver'] },
  { id_usuario: 'USU006', mascotas: ['Zeus', 'Kiara', 'Bimba'] },
  { id_usuario: 'USU007', mascotas: ['Kira', 'Dante', 'Lola'] },
  { id_usuario: 'USU008', mascotas: ['Sam', 'Frida', 'Chester'] },
  { id_usuario: 'USU009', mascotas: ['Pelusa', 'Apolo', 'Greta'] },
  { id_usuario: 'USU010', mascotas: ['Jack', 'Bobby', 'Mona'] },
];

const demostraciones = [
  { especialista: 'ESP001', mascota: 'Max', horaAtendida: '09:00:00', horaCancelada: '11:00:00', horaPendiente: '14:00:00', diagnostico: 'Otitis externa leve', tratamiento: 'Gotas óticas durante 7 días', observaciones: 'Control veterinario en 10 días.' },
  { especialista: 'ESP002', mascota: 'Rocky', horaAtendida: '09:00:00', horaCancelada: '11:00:00', horaPendiente: '14:00:00', diagnostico: 'Dermatitis alérgica controlada', tratamiento: 'Baño medicado y control en 15 días', observaciones: 'Revisar evolución de la piel.' },
  { especialista: 'ESP003', mascota: 'Nala', horaAtendida: '09:00:00', horaCancelada: '11:00:00', horaPendiente: '14:00:00', diagnostico: 'Revisión general felina', tratamiento: 'Continuar alimentación recomendada', observaciones: 'Signos vitales dentro de los parámetros esperados.' },
];

function comoFecha(fecha) { return new Date(`${fecha}T00:00:00.000Z`); }
function comoHora(hora) {
  const [hh, mm, ss = '00'] = hora.split(':');
  return new Date(Date.UTC(1970, 0, 1, Number(hh), Number(mm), Number(ss)));
}

async function sembrarUsuarios() {
  const contrasena = await hashContrasena(CONTRASENA_DEMO);
  for (const usuario of usuariosDemo) {
    await prisma.usuario.upsert({
      where: { id_usuario: usuario.id_usuario },
      update: { ...usuario, contrasena },
      create: { ...usuario, contrasena },
    });
  }
}

async function sembrarRazas() {
  const ids = new Map();
  for (const nombre of razasDemo) {
    let raza = await prisma.raza.findFirst({ where: { nombre }, orderBy: { id_raza: 'asc' } });
    if (!raza) raza = await prisma.raza.create({ data: { nombre } });
    ids.set(nombre, raza.id_raza);
  }
  return ids;
}

async function sembrarMascotas(idsRaza) {
  const ids = new Map();
  for (const datos of mascotasDemo) {
    const fecha = comoFecha(datos.fecha_nacimiento);
    let mascota = await prisma.mascota.findFirst({
      where: { nombre: datos.nombre, fecha_nacimiento: fecha, especie: datos.especie, genero: datos.genero, id_raza: idsRaza.get(datos.raza) },
    });
    if (!mascota) {
      const { raza: _raza, ...datosMascota } = datos;
      mascota = await prisma.mascota.create({ data: { ...datosMascota, fecha_nacimiento: fecha, id_raza: idsRaza.get(datos.raza) } });
    }
    ids.set(datos.nombre, mascota.id_mascota);
  }
  for (const relacion of relacionesDemo) {
    for (const nombre of relacion.mascotas) {
      await prisma.usuarioMascota.upsert({
        where: { id_usuario_id_mascota: { id_usuario: relacion.id_usuario, id_mascota: ids.get(nombre) } },
        update: {},
        create: { id_usuario: relacion.id_usuario, id_mascota: ids.get(nombre) },
      });
    }
    const nombresPermitidos = new Set(relacion.mascotas);
    const relacionesActuales = await prisma.usuarioMascota.findMany({ where: { id_usuario: relacion.id_usuario }, include: { mascota: { select: { nombre: true } } } });
    for (const actual of relacionesActuales) {
      if (!nombresPermitidos.has(actual.mascota.nombre)) {
        await prisma.usuarioMascota.delete({ where: { id_usuario_id_mascota: { id_usuario: relacion.id_usuario, id_mascota: actual.id_mascota } } });
      }
    }
  }
  return ids;
}

async function obtenerOCrearDisponibilidad(id_usuario, hora, estado) {
  const fecha = comoFecha(FECHA_DEMO);
  const horaDb = comoHora(hora);
  return prisma.disponibilidad.upsert({
    where: { id_usuario_fecha_hora: { id_usuario, fecha, hora: horaDb } },
    update: { estado },
    create: { id_usuario, fecha, hora: horaDb, estado },
  });
}

async function obtenerOCrearCita({ id_mascota, id_disponibilidad, estado, motivo }) {
  let cita = await prisma.cita.findFirst({ where: { id_recepcionista: 'REC001', id_mascota, id_disponibilidad } });
  if (!cita) {
    cita = await prisma.cita.create({ data: { id_recepcionista: 'REC001', id_mascota, id_disponibilidad, estado, motivo } });
  } else {
    cita = await prisma.cita.update({ where: { id_cita: cita.id_cita }, data: { estado, motivo } });
  }
  return cita;
}

async function sembrarHistoria(cita, datos) {
  await prisma.historiaClinica.upsert({
    where: { id_cita: cita.id_cita },
    update: { peso: datos.peso, diagnostico: datos.diagnostico, tratamiento: datos.tratamiento, observaciones: datos.observaciones },
    create: { id_cita: cita.id_cita, peso: datos.peso, diagnostico: datos.diagnostico, tratamiento: datos.tratamiento, observaciones: datos.observaciones },
  });
}

async function sembrarCancelacion(cita) {
  await prisma.citaCancelacion.upsert({
    where: { id_cita: cita.id_cita },
    update: { id_usuario_actor: 'REC001', rol_actor: 'recepcionista', origen: 'manual', motivo: 'Demostración de cita cancelada' },
    create: { id_cita: cita.id_cita, id_usuario_actor: 'REC001', rol_actor: 'recepcionista', origen: 'manual', motivo: 'Demostración de cita cancelada' },
  });
}

async function sembrarNotificacion({ id_usuario, tipo, asunto, mensaje, id_cita = null, id_disponibilidad = null }) {
  const existente = await prisma.notificacion.findFirst({ where: { id_usuario, tipo, asunto, mensaje } });
  if (!existente) await prisma.notificacion.create({ data: { id_usuario, tipo, asunto, mensaje, id_cita, id_disponibilidad, leida: false } });
}

async function sembrarDatosBaseParaPruebas(idsMascota) {
  // Se conservan las franjas históricas que usan los fixtures de integración
  // (IDs 1, 2, 3, 31 y 32) antes de anexar la demo visible del 27 de noviembre.
  for (const id_usuario of ['ESP001', 'ESP002', 'ESP003']) {
    for (const fechaTexto of ['2026-08-19', '2026-08-20', '2026-08-21']) {
      for (let hora = 8; hora <= 17; hora += 1) {
        await prisma.disponibilidad.upsert({
          where: { id_usuario_fecha_hora: { id_usuario, fecha: comoFecha(fechaTexto), hora: comoHora(`${String(hora).padStart(2, '0')}:00:00`) } },
          update: {},
          create: { id_usuario, fecha: comoFecha(fechaTexto), hora: comoHora(`${String(hora).padStart(2, '0')}:00:00`), estado: 'disponible' },
        });
      }
    }
  }

  const disponibilidadBase = await prisma.disponibilidad.findFirst({ where: { id_usuario: 'ESP001', fecha: comoFecha('2026-08-19'), hora: comoHora('08:00:00') } });
  let citaBase = await prisma.cita.findFirst({ where: { id_recepcionista: 'REC001', id_mascota: idsMascota.get('Max'), id_disponibilidad: disponibilidadBase.id_disponibilidad } });
  if (!citaBase) {
    citaBase = await prisma.cita.create({ data: { id_recepcionista: 'REC001', id_mascota: idsMascota.get('Max'), id_disponibilidad: disponibilidadBase.id_disponibilidad, motivo: 'Consulta veterinaria general', estado: 'pendiente' } });
  }
  await sembrarHistoria(citaBase, { peso: 18.5, diagnostico: 'Otitis externa leve', tratamiento: 'Limpieza del conducto auditivo y gotas óticas durante 7 días', observaciones: 'Control veterinario en 10 días.' });
}

async function sembrarDemostraciones(idsMascota) {
  for (const demo of demostraciones) {
    const atendidaDisponibilidad = await obtenerOCrearDisponibilidad(demo.especialista, demo.horaAtendida, 'ocupado');
    const canceladaDisponibilidad = await obtenerOCrearDisponibilidad(demo.especialista, demo.horaCancelada, 'disponible');
    const pendienteDisponibilidad = await obtenerOCrearDisponibilidad(demo.especialista, demo.horaPendiente, 'ocupado');
    const mascotaAtendida = idsMascota.get(demo.mascota);
    const citaAtendida = await obtenerOCrearCita({ id_mascota: mascotaAtendida, id_disponibilidad: atendidaDisponibilidad.id_disponibilidad, estado: 'atendido', motivo: `Consulta atendida de ${demo.mascota}` });
    await sembrarHistoria(citaAtendida, { peso: 18.5, diagnostico: demo.diagnostico, tratamiento: demo.tratamiento, observaciones: demo.observaciones });
    const citaCancelada = await obtenerOCrearCita({ id_mascota: mascotaAtendida, id_disponibilidad: canceladaDisponibilidad.id_disponibilidad, estado: 'cancelado', motivo: `Cita cancelada de ${demo.mascota}` });
    await sembrarCancelacion(citaCancelada);
    const citaPendiente = await obtenerOCrearCita({ id_mascota: mascotaAtendida, id_disponibilidad: pendienteDisponibilidad.id_disponibilidad, estado: 'pendiente', motivo: `Consulta pendiente de ${demo.mascota}` });

    await sembrarNotificacion({ id_usuario: demo.especialista, tipo: 'nueva_cita', asunto: 'Nueva cita asignada', mensaje: `Se asignó una cita demostrativa para el ${FECHA_DEMO} a las ${demo.horaPendiente.slice(0, 5)}.`, id_cita: citaPendiente.id_cita });
    await sembrarNotificacion({ id_usuario: demo.especialista, tipo: 'cambio_estado_cita', asunto: 'Cita atendida', mensaje: `La cita de ${demo.mascota} cambió al estado atendido.`, id_cita: citaAtendida.id_cita });
    await sembrarNotificacion({ id_usuario: demo.especialista, tipo: 'cambio_estado_cita', asunto: 'Cita cancelada', mensaje: `La cita de ${demo.mascota} cambió al estado cancelado.`, id_cita: citaCancelada.id_cita });
  }
}

async function sembrarFranjasFuturas() {
  const especialistas = ['ESP001', 'ESP002', 'ESP003'];
  const fechas = ['2026-11-28', '2026-11-29', '2026-11-30'];
  for (const id_usuario of especialistas) {
    for (const fechaTexto of fechas) {
      const hora = '08:00:00';
      await prisma.disponibilidad.upsert({
        where: { id_usuario_fecha_hora: { id_usuario, fecha: comoFecha(fechaTexto), hora: comoHora(hora) } },
        update: { estado: 'disponible' },
        create: { id_usuario, fecha: comoFecha(fechaTexto), hora: comoHora(hora), estado: 'disponible' },
      });
    }
  }
}

async function sembrarHistoriasPorUsuario(idsMascota) {
  let candidatoGlobal = 1;
  for (const relacion of relacionesDemo) {
    const idsPropietario = relacion.mascotas.map((nombre) => idsMascota.get(nombre));
    const historiasExistentes = await prisma.historiaClinica.findMany({
      where: { cita: { id_mascota: { in: idsPropietario } } },
      select: { id_historia_clinica: true },
    });
    let historiasPorCrear = Math.max(0, 3 - historiasExistentes.length);
    let indice = 0;
    while (historiasPorCrear > 0) {
      const nombreMascota = relacion.mascotas[indice % relacion.mascotas.length];
      const id_mascota = idsMascota.get(nombreMascota);
      const historiaDeMascota = await prisma.historiaClinica.findFirst({ where: { cita: { id_mascota } } });
      if (!historiaDeMascota || historiasExistentes.length + historiasPorCrear > 3) {
        const especialista = ['ESP001', 'ESP002', 'ESP003'][indice % 3];
        let candidato = candidatoGlobal;
        let disponibilidad = null;
        while (!disponibilidad) {
          const fecha = `2026-10-${String(((candidato - 1) % 28) + 1).padStart(2, '0')}`;
          const hora = `${String(8 + (candidato % 8)).padStart(2, '0')}:00:00`;
          const existente = await prisma.disponibilidad.findUnique({ where: { id_usuario_fecha_hora: { id_usuario: especialista, fecha: comoFecha(fecha), hora: comoHora(hora) } } });
          if (!existente) {
            disponibilidad = await prisma.disponibilidad.create({ data: { id_usuario: especialista, fecha: comoFecha(fecha), hora: comoHora(hora), estado: 'ocupado' } });
          } else {
            const citaActiva = await prisma.cita.findFirst({ where: { id_disponibilidad: existente.id_disponibilidad, estado: { not: 'cancelado' } } });
            if (!citaActiva) {
              disponibilidad = await prisma.disponibilidad.update({ where: { id_disponibilidad: existente.id_disponibilidad }, data: { estado: 'ocupado' } });
            } else {
              candidato += 1;
            }
          }
        }
        const cita = await obtenerOCrearCita({ id_mascota, id_disponibilidad: disponibilidad.id_disponibilidad, estado: 'atendido', motivo: `Control clínico demo de ${nombreMascota}` });
        await sembrarHistoria(cita, { peso: 4 + (indice * 0.8), diagnostico: `Valoración preventiva de ${nombreMascota}`, tratamiento: 'Plan preventivo, vacunación y control periódico', observaciones: 'Evolución estable. Continuar cuidados en casa y asistir al próximo control.' });
        historiasPorCrear -= 1;
        candidatoGlobal += 1;
      }
      indice += 1;
    }
  }
}

async function main() {
  await sembrarUsuarios();
  const idsRaza = await sembrarRazas();
  const idsMascota = await sembrarMascotas(idsRaza);
  await sembrarDatosBaseParaPruebas(idsMascota);
  if (process.env.NODE_ENV !== 'test' || process.env.SEED_DEMO === 'true') {
    await sembrarDemostraciones(idsMascota);
    await sembrarFranjasFuturas();
    await sembrarHistoriasPorUsuario(idsMascota);
    console.log(`🌱 Seed demo listo: 3 mascotas y 3 historias por cada usuario demo; 3 franjas y 3 notificaciones por especialista.`);
  } else {
    console.log('🌱 Seed base de pruebas listo; la demo del 27 de noviembre se omite en NODE_ENV=test.');
  }
}

main()
  .catch((error) => {
    process.stderr.write(`No fue posible completar la semilla Prisma (${error?.code || error?.name || 'ERROR'}).\n`);
    process.exitCode = 1;
  })
  .finally(async () => { await prisma.$disconnect(); });
