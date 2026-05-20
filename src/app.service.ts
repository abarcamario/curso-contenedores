import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { isDbEnabled } from './config/app.config';

@Injectable()
export class AppService {
  private leaks: number[][] = []; // aquí guardamos los "leaks"

  constructor(private readonly moduleRef: ModuleRef) {}

  getHello(): string {
    return 'Hello World!';
  }

  getHi(): string {
    return 'Hi there!!!';
  }

  /**
   * Ejecuta una carga intensiva de CPU durante ~10 segundos.
   *
   * Qué hace:
   * - Mantiene un bucle activo realizando operaciones matematicas.
   * - Simula trabajo pesado del procesador para pruebas de rendimiento.
   *
   * Como se usa:
   * - Invoca el endpoint/controlador que llame este metodo.
   * - Util en pruebas de carga para observar consumo de CPU, latencia y estabilidad.
   */
  runCpuTask(): string {
    const start = Date.now();
    let count = 0;

    // Bucle que consume CPU por al menos 10 segundo
    while (Date.now() - start < 10000) {
      count += Math.sqrt(Math.random() * Math.random());
    }

    return `Test de cpu terminado! Iteraciones: ${count}`;
  }

  /**
   * Reserva memoria en RAM y la mantiene referenciada para simular fuga de memoria.
   *
   * Qué hace:
   * - Crea un arreglo de numeros aleatorios del tamano indicado en MB.
   * - Guarda el arreglo en `this.leaks` para evitar que el recolector lo libere.
   *
   * Como se usa:
   * - Pasa el parametro `size` (MB) al invocar el endpoint/controlador asociado.
   * - Llamadas repetidas incrementan el uso de memoria y permiten probar limites de RAM.
   */
  runMemoryTask(size: number): string {
    const arr: number[] = [];

    for (let i = 0; i < (size * 1024 * 1024) / 8; i++) {
      arr.push(Math.random());
    }

    this.leaks.push(arr);

    return `Alojados ~${size} MB de memoria. Total de fuga de memoria: ${this.leaks.length}`;
  }

  getLiveness() {
    return {
      status: 'ok',
      check: 'live',
      timestamp: new Date().toISOString(),
    };
  }

  getReadiness() {
    if (!isDbEnabled()) {
      return this.buildReadinessResponse('ok', false, 'skipped');
    }

    const dataSource = this.moduleRef.get(DataSource, { strict: false });

    if (!dataSource || !dataSource.isInitialized) {
      this.throwReadinessUnavailable();
    }

    return this.buildReadinessResponse('ok', true, 'up');
  }

  private buildReadinessResponse(
    status: 'ok' | 'error',
    dbEnabled: boolean,
    dbStatus: 'up' | 'down' | 'skipped',
  ) {
    return {
      status,
      check: 'ready',
      database: {
        enabled: dbEnabled,
        status: dbStatus,
      },
      timestamp: new Date().toISOString(),
    };
  }

  private throwReadinessUnavailable(): never {
    throw new ServiceUnavailableException(
      this.buildReadinessResponse('error', true, 'down'),
    );
  }
}
