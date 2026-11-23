// tests/unit/utils/sqlSeguro.test.js
// Validación de parámetros usados en consultas SQL crudas.
import { aIdEntero, aLimiteEntero, aMarcaTiempoOpcional } from '../../../app/utils/sqlSeguro.js';

const ATAQUES = ["' OR 1=1 --", "' OR '1'='1", "admin' --", '1 OR 1=1', '1; DROP TABLE cita', '1--'];

describe('utils/sqlSeguro', () => {
  describe('aIdEntero', () => {
    it('acepta enteros positivos como número o texto', () => {
      expect(aIdEntero(5)).toBe(5);
      expect(aIdEntero('42')).toBe(42);
      expect(aIdEntero(' 7 ')).toBe(7);
    });

    it('rechaza con 400 las cargas de SQL Injection y valores no enteros', () => {
      for (const valor of [...ATAQUES, '', '0', '-1', '1.5', 'abc', null, undefined, {}, [], NaN, 0, -3, 2.5]) {
        expect(() => aIdEntero(valor)).toThrow(expect.objectContaining({ statusCode: 400 }));
      }
    });
  });

  describe('aLimiteEntero', () => {
    it('acepta valores dentro del rango', () => {
      expect(aLimiteEntero(100, { minimo: 1, maximo: 1000 })).toBe(100);
    });

    it('rechaza texto, inyecciones y valores fuera del rango', () => {
      for (const valor of [...ATAQUES, '100', 0, 1001, 1.5, null]) {
        expect(() => aLimiteEntero(valor, { minimo: 1, maximo: 1000 })).toThrow(TypeError);
      }
    });
  });

  describe('aMarcaTiempoOpcional', () => {
    it('acepta null, Date y texto ISO 8601 con zona', () => {
      const fecha = new Date('2026-08-18T12:00:00-05:00');
      expect(aMarcaTiempoOpcional(null)).toBeNull();
      expect(aMarcaTiempoOpcional(undefined)).toBeNull();
      expect(aMarcaTiempoOpcional(fecha)).toBe(fecha);
      expect(aMarcaTiempoOpcional('2026-08-18T12:00:00-05:00')).toBe('2026-08-18T12:00:00-05:00');
    });

    it('rechaza cargas de inyección y fechas inválidas', () => {
      for (const valor of [...ATAQUES, "2026-08-18T12:00:00Z'; DROP TABLE cita; --", 'mañana', new Date('x'), 123]) {
        expect(() => aMarcaTiempoOpcional(valor)).toThrow(TypeError);
      }
    });
  });
});
