import 'dotenv/config';
import pg from 'pg';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildDatabaseUrl } from '../app/config/databaseUrl.js';

const { Client } = pg;
const BACK_ROOT = fileURLToPath(new URL('../', import.meta.url));

const columnasEsperadas = {
  usuario: {
    id_usuario: ['character varying', 10], nombre: ['character varying', 100],
    apellidos: ['character varying', 150], telefono: ['character varying', 20],
    correo: ['character varying', 150], direccion: ['character varying', 150],
    contrasena: ['character varying', 255], especializacion: ['character varying', 100],
    tipo: ['character varying', 20], rol: ['character varying', 20],
    fecha_registro: ['timestamp with time zone', null],
  },
  raza: {
    id_raza: ['integer', null], nombre: ['character varying', 200],
    fecha_registro: ['timestamp with time zone', null],
  },
  mascota: {
    id_mascota: ['integer', null], nombre: ['character varying', 200],
    fecha_nacimiento: ['date', null], especie: ['character varying', 50],
    genero: ['character varying', 20], id_raza: ['integer', null],
    fecha_registro: ['timestamp with time zone', null],
  },
  usuario_mascota: { id_usuario: ['character varying', 10], id_mascota: ['integer', null] },
  disponibilidad: {
    id_disponibilidad: ['integer', null], id_usuario: ['character varying', 10],
    fecha: ['date', null], hora: ['time without time zone', null], estado: ['character varying', 20],
  },
  cita: {
    id_cita: ['integer', null], id_recepcionista: ['character varying', 10],
    id_mascota: ['integer', null], id_disponibilidad: ['integer', null],
    motivo: ['character varying', 200], estado: ['character varying', 20],
  },
  historia_clinica: {
    id_historia_clinica: ['integer', null], id_cita: ['integer', null],
    peso: ['numeric', null], diagnostico: ['character varying', 200],
    tratamiento: ['character varying', 200], observaciones: ['character varying', 500],
    fecha_registro: ['timestamp with time zone', null],
  },
};

const constraintsRequeridas = [
  'usuario_pkey', 'usuario_correo_key', 'chk_usuario_rol', 'chk_usuario_tipo',
  'raza_pkey',
  'mascota_pkey', 'mascota_id_raza_fkey', 'chk_mascota_especie', 'chk_mascota_genero',
  'usuario_mascota_pkey', 'usuario_mascota_id_usuario_fkey', 'usuario_mascota_id_mascota_fkey',
  'disponibilidad_pkey', 'disponibilidad_id_usuario_fkey', 'uq_disponibilidad_usuario_fecha_hora', 'chk_disponibilidad_estado',
  'cita_pkey', 'cita_id_recepcionista_fkey', 'cita_id_mascota_fkey', 'cita_id_disponibilidad_fkey', 'chk_cita_estado',
  'historia_clinica_pkey', 'historia_clinica_id_cita_key', 'historia_clinica_id_cita_fkey', 'chk_historia_peso',
];

function abortar() {
  process.stderr.write(
    'No se aplicó ningún cambio: la base existente no coincide con el baseline esperado. ' +
    'Verifica un respaldo y revisa su esquema antes de ejecutar una adopción manual.\n',
  );
  process.exitCode = 1;
}

async function main() {
  const client = new Client({ connectionString: buildDatabaseUrl() });
  try {
    await client.connect();
    const { rows: migrationTable } = await client.query(
      `SELECT to_regclass('public._prisma_migrations') AS table_name`,
    );
    if (migrationTable[0].table_name) return;

    const tableNames = Object.keys(columnasEsperadas);
    const { rows: foundTables } = await client.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_name = ANY($2::text[])',
      ['public', tableNames],
    );
    if (foundTables.length === 0) return;
    if (foundTables.length !== tableNames.length) return abortar();

    const { rows: columns } = await client.query(
      `SELECT table_name, column_name, data_type, character_maximum_length, numeric_precision, numeric_scale
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = ANY($1::text[])`,
      [tableNames],
    );
    const columnsByTable = new Map(tableNames.map((table) => [table, new Map()]));
    for (const column of columns) columnsByTable.get(column.table_name).set(column.column_name, column);

    for (const [table, expectedColumns] of Object.entries(columnasEsperadas)) {
      const actualColumns = columnsByTable.get(table);
      if (actualColumns.size !== Object.keys(expectedColumns).length) return abortar();
      for (const [name, [dataType, length]] of Object.entries(expectedColumns)) {
        const actual = actualColumns.get(name);
        if (!actual || actual.data_type !== dataType) return abortar();
        if (length !== null && Number(actual.character_maximum_length) !== length) return abortar();
        if (table === 'historia_clinica' && name === 'peso'
          && (Number(actual.numeric_precision) !== 5 || Number(actual.numeric_scale) !== 2)) return abortar();
      }
    }

    const { rows: constraints } = await client.query(
      `SELECT conname FROM pg_constraint
       WHERE connamespace = 'public'::regnamespace AND conname = ANY($1::text[])`,
      [constraintsRequeridas],
    );
    if (constraints.length !== constraintsRequeridas.length) return abortar();

    const { rows: activeIndex } = await client.query(
      `SELECT indexdef FROM pg_indexes
       WHERE schemaname = 'public' AND indexname = 'uq_cita_disponibilidad_activa'`,
    );
    const indexDefinition = activeIndex[0]?.indexdef?.toLowerCase() || '';
    if (!indexDefinition.includes('create unique index')
      || !indexDefinition.includes('id_disponibilidad')
      || !indexDefinition.includes('where')
      || !indexDefinition.includes('cancelado')) return abortar();

    const { rows: triggers } = await client.query(
      `SELECT t.tgname, c.relname AS table_name, p.proname AS function_name, t.tgenabled
       FROM pg_trigger t
       JOIN pg_class c ON c.oid = t.tgrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
       JOIN pg_proc p ON p.oid = t.tgfoid
       WHERE n.nspname = 'public' AND NOT t.tgisinternal`,
    );
    const triggerDisponible = triggers.some((row) =>
      row.tgname === 'trg_actualizar_disponibilidad_cita'
      && row.table_name === 'cita'
      && row.function_name === 'actualizar_disponibilidad_cita'
      && row.tgenabled !== 'D');
    const triggerHistoria = triggers.some((row) =>
      row.tgname === 'trg_historia_cita_atendida'
      && row.table_name === 'historia_clinica'
      && row.function_name === 'actualizar_cita_atendida'
      && row.tgenabled !== 'D');
    if (!triggerDisponible || !triggerHistoria) return abortar();

    await client.end();
    execFileSync('npx', ['prisma', 'migrate', 'resolve', '--applied', '0_init'], {
      cwd: BACK_ROOT,
      env: process.env,
      stdio: 'inherit',
    });
    process.stdout.write('Baseline Prisma registrado; no se modificaron filas existentes.\n');
  } catch {
    abortar();
  } finally {
    await client.end().catch(() => {});
  }
}

main();
