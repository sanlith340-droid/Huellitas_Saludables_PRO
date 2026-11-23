import { prisma } from '../app/config/prisma.js';
import { hashContrasena } from '../app/utils/password.js';

const usuariosDemo = [
  { id_usuario: 'REC001', nombre: 'Laura', apellidos: 'Gomez Rodriguez', telefono: '3001112233', correo: 'laura.gomez@proyectohs.com', direccion: 'Calle 80 # 15-20', contrasena: '123456', especializacion: null, tipo: null, rol: 'recepcionista' },
  { id_usuario: 'REC002', nombre: 'Andrea', apellidos: 'Martinez Lopez', telefono: '3012223344', correo: 'andrea.martinez@proyectohs.com', direccion: 'Carrera 13 # 72-15', contrasena: '123456', especializacion: null, tipo: null, rol: 'recepcionista' },
  { id_usuario: 'REC003', nombre: 'Carlos', apellidos: 'Torres Perez', telefono: '3023334455', correo: 'carlos.torres@proyectohs.com', direccion: 'Calle 100 # 18-30', contrasena: '123456', especializacion: null, tipo: null, rol: 'recepcionista' },
  { id_usuario: 'ADM001', nombre: 'Juan', apellidos: 'Rodriguez Sanchez', telefono: '3104445566', correo: 'juan.rodriguez@proyectohs.com', direccion: 'Carrera 7 # 85-20', contrasena: '123456', especializacion: null, tipo: null, rol: 'admin' },
  { id_usuario: 'USU001', nombre: 'Pedro', apellidos: 'Gonzalez Ramirez', telefono: '3115556677', correo: 'pedro.gonzalez@gmail.com', direccion: 'Calle 45 # 20-10', contrasena: '123456', especializacion: null, tipo: 'principal', rol: 'usuario' },
  { id_usuario: 'USU002', nombre: 'Maria', apellidos: 'Lopez Hernandez', telefono: '3126667788', correo: 'maria.lopez@gmail.com', direccion: 'Carrera 30 # 45-25', contrasena: '123456', especializacion: null, tipo: 'principal', rol: 'usuario' },
  { id_usuario: 'USU003', nombre: 'Andres', apellidos: 'Martinez Castro', telefono: '3137778899', correo: 'andres.martinez@gmail.com', direccion: 'Calle 60 # 25-15', contrasena: '123456', especializacion: null, tipo: 'principal', rol: 'usuario' },
  { id_usuario: 'USU004', nombre: 'Diana', apellidos: 'Perez Moreno', telefono: '3148889900', correo: 'diana.perez@gmail.com', direccion: 'Carrera 50 # 80-20', contrasena: '123456', especializacion: null, tipo: 'principal', rol: 'usuario' },
  { id_usuario: 'USU005', nombre: 'Felipe', apellidos: 'Sanchez Torres', telefono: '3159990011', correo: 'felipe.sanchez@gmail.com', direccion: 'Calle 72 # 40-18', contrasena: '123456', especializacion: null, tipo: 'principal', rol: 'usuario' },
  { id_usuario: 'USU006', nombre: 'Natalia', apellidos: 'Ramirez Vargas', telefono: '3161112233', correo: 'natalia.ramirez@gmail.com', direccion: 'Carrera 19 # 65-30', contrasena: '123456', especializacion: null, tipo: 'principal', rol: 'usuario' },
  { id_usuario: 'USU007', nombre: 'Santiago', apellidos: 'Moreno Diaz', telefono: '3172223344', correo: 'santiago.moreno@gmail.com', direccion: 'Calle 90 # 22-40', contrasena: '123456', especializacion: null, tipo: 'principal', rol: 'usuario' },
  { id_usuario: 'USU008', nombre: 'Camila', apellidos: 'Vargas Ruiz', telefono: '3183334455', correo: 'camila.vargas@gmail.com', direccion: 'Carrera 11 # 60-25', contrasena: '123456', especializacion: null, tipo: 'acudiente', rol: 'usuario' },
  { id_usuario: 'USU009', nombre: 'Ricardo', apellidos: 'Diaz Herrera', telefono: '3194445566', correo: 'ricardo.diaz@gmail.com', direccion: 'Calle 35 # 15-40', contrasena: '123456', especializacion: null, tipo: 'acudiente', rol: 'usuario' },
  { id_usuario: 'USU010', nombre: 'Valentina', apellidos: 'Ruiz Molina', telefono: '3205556677', correo: 'valentina.ruiz@gmail.com', contrasena: '123456', direccion: 'Carrera 40 # 70-10', especializacion: null, tipo: 'acudiente', rol: 'usuario' },
  { id_usuario: 'ESP001', nombre: 'Alejandro', apellidos: 'Castillo Moreno', telefono: '3211112233', correo: 'alejandro.castillo@proyectohs.com', direccion: 'Carrera 15 # 80-25', contrasena: '123456', especializacion: 'Medicina Veterinaria General', tipo: null, rol: 'especialista' },
  { id_usuario: 'ESP002', nombre: 'Carolina', apellidos: 'Mendez Torres', telefono: '3222223344', correo: 'carolina.mendez@proyectohs.com', direccion: 'Calle 90 # 18-35', contrasena: '123456', especializacion: 'Medicina Felina', tipo: null, rol: 'especialista' },
  { id_usuario: 'ESP003', nombre: 'Mauricio', apellidos: 'Rojas Hernandez', telefono: '3233334455', correo: 'mauricio.rojas@proyectohs.com', direccion: 'Carrera 50 # 75-40', contrasena: '123456', especializacion: 'Cirugia Veterinaria', tipo: null, rol: 'especialista' },
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
];

const relacionesDemo = [
  { id_usuario: 'USU001', mascotas: ['Max', 'Luna'] },
  { id_usuario: 'USU002', mascotas: ['Rocky'] },
  { id_usuario: 'USU003', mascotas: ['Nala', 'Bruno'] },
  { id_usuario: 'USU004', mascotas: ['Mia'] },
  { id_usuario: 'USU005', mascotas: ['Toby', 'Coco'] },
  { id_usuario: 'USU006', mascotas: ['Zeus'] },
  { id_usuario: 'USU007', mascotas: ['Kira'] },
  { id_usuario: 'USU008', mascotas: ['Max', 'Rocky'] },
  { id_usuario: 'USU009', mascotas: ['Nala', 'Toby'] },
  { id_usuario: 'USU010', mascotas: ['Luna', 'Zeus'] },
];

function comoFecha(fecha) {
  return new Date(`${fecha}T00:00:00.000Z`);
}

function comoHora(hora) {
  const [hh, mm, ss = '00'] = hora.split(':');
  return new Date(Date.UTC(1970, 0, 1, Number(hh), Number(mm), Number(ss)));
}

async function sembrarUsuarios() {
  for (const usuario of usuariosDemo) {
    const { contrasena, ...datos } = usuario;
    const hash = await hashContrasena(contrasena);
    await prisma.usuario.upsert({
      where: { id_usuario: usuario.id_usuario },
      update: {},
      create: { ...datos, contrasena: hash },
    });
  }
}

async function sembrarRazas() {
  const idRazaPorNombre = new Map();
  for (const nombre of razasDemo) {
    let raza = await prisma.raza.findFirst({ where: { nombre }, orderBy: { id_raza: 'asc' } });
    if (!raza) raza = await prisma.raza.create({ data: { nombre } });
    idRazaPorNombre.set(nombre, raza.id_raza);
  }
  return idRazaPorNombre;
}

async function sembrarMascotas(idRazaPorNombre) {
  const idMascotaPorNombre = new Map();
  for (const datos of mascotasDemo) {
    const fecha = comoFecha(datos.fecha_nacimiento);
    let mascota = await prisma.mascota.findFirst({
      where: {
        nombre: datos.nombre,
        fecha_nacimiento: fecha,
        especie: datos.especie,
        genero: datos.genero,
        id_raza: idRazaPorNombre.get(datos.raza),
      },
      orderBy: { id_mascota: 'asc' },
    });
    if (!mascota) {
      mascota = await prisma.mascota.create({
        data: {
          nombre: datos.nombre,
          fecha_nacimiento: fecha,
          especie: datos.especie,
          genero: datos.genero,
          id_raza: idRazaPorNombre.get(datos.raza),
        },
      });
    }
    idMascotaPorNombre.set(datos.nombre, mascota.id_mascota);
  }

  for (const relacion of relacionesDemo) {
    for (const nombre of relacion.mascotas) {
      const id_mascota = idMascotaPorNombre.get(nombre);
      await prisma.usuarioMascota.upsert({
        where: { id_usuario_id_mascota: { id_usuario: relacion.id_usuario, id_mascota } },
        update: {},
        create: { id_usuario: relacion.id_usuario, id_mascota },
      });
    }
  }
  return idMascotaPorNombre;
}

async function sembrarDisponibilidades() {
  for (const id_usuario of ['ESP001', 'ESP002', 'ESP003']) {
    for (const fechaTexto of ['2026-08-19', '2026-08-20', '2026-08-21']) {
      for (let hora = 8; hora <= 17; hora += 1) {
        const fecha = comoFecha(fechaTexto);
        const horaTexto = `${String(hora).padStart(2, '0')}:00:00`;
        const horaDb = comoHora(horaTexto);
        const existente = await prisma.disponibilidad.findFirst({
          where: { id_usuario, fecha, hora: horaDb },
          select: { id_disponibilidad: true },
        });
        if (!existente) {
          await prisma.disponibilidad.create({
            data: { id_usuario, fecha, hora: horaDb, estado: 'disponible' },
          });
        }
      }
    }
  }
}

async function sembrarCitaEHistoria(idMascotaPorNombre) {
  const fecha = comoFecha('2026-08-19');
  const hora = comoHora('08:00:00');
  let disponibilidad = await prisma.disponibilidad.findFirst({
    where: { id_usuario: 'ESP001', fecha, hora },
  });
  if (!disponibilidad) {
    disponibilidad = await prisma.disponibilidad.create({
      data: { id_usuario: 'ESP001', fecha, hora, estado: 'disponible' },
    });
  }

  let cita = await prisma.cita.findFirst({
    where: {
      id_recepcionista: 'REC001',
      id_mascota: idMascotaPorNombre.get('Max'),
      id_disponibilidad: disponibilidad.id_disponibilidad,
    },
  });
  if (!cita) {
    cita = await prisma.cita.create({
      data: {
        id_recepcionista: 'REC001',
        id_mascota: idMascotaPorNombre.get('Max'),
        id_disponibilidad: disponibilidad.id_disponibilidad,
        motivo: 'Consulta veterinaria general',
        estado: 'pendiente',
      },
    });
  }

  const historia = await prisma.historiaClinica.findUnique({
    where: { id_cita: cita.id_cita },
    select: { id_historia_clinica: true },
  });
  if (!historia) {
    await prisma.historiaClinica.create({
      data: {
        id_cita: cita.id_cita,
        peso: 18.5,
        diagnostico: 'Otitis externa leve',
        tratamiento: 'Limpieza del conducto auditivo y tratamiento con gotas óticas durante 7 días',
        observaciones: 'La mascota presenta inflamación leve. Se recomienda control veterinario en 10 días.',
      },
    });
  }
}

async function main() {
  await sembrarUsuarios();
  const idRazaPorNombre = await sembrarRazas();
  const idMascotaPorNombre = await sembrarMascotas(idRazaPorNombre);
  await sembrarDisponibilidades();
  await sembrarCitaEHistoria(idMascotaPorNombre);
}

main()
  .catch((error) => {
    // El CLI informa el fallo; no se imprime contenido de filas ni datos personales.
    process.stderr.write(`No fue posible completar la semilla Prisma (${error?.code || error?.name || 'ERROR'}).\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
