import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint de saludo basico.
   * HTTP: GET /hello
   * Ejemplo: curl http://localhost:3000/hello
   */
  @Get('/hello')
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Endpoint de saludo alternativo.
   * HTTP: GET /hi
   * Ejemplo: curl http://localhost:3000/hi
   */
  @Get('/hi')
  getHi(): string {
    return this.appService.getHi();
  }

  /**
   * Endpoint para prueba de carga de CPU.
   * HTTP: GET /cpu
   * Ejemplo: curl http://localhost:3000/cpu
   */
  @Get('cpu')
  getCpuTest(): string {
    return this.appService.runCpuTask();
  }

  /**
   * Endpoint para prueba de consumo/fuga de memoria.
   * HTTP: GET /memory?size=<MB>
   * Ejemplos:
   * - curl http://localhost:3000/memory
   * - curl "http://localhost:3000/memory?size=200"
   *
   * Parametros:
   * - size: cantidad de MB a reservar en cada llamada.
   * - Valor por defecto si no se envia: 100 MB.
   */
  @Get('memory')
  getMemoryTest(@Query('size') size?: string): string {
    const mb = size ? parseInt(size, 10) : 100; // 100 MB por defecto
    return this.appService.runMemoryTask(mb);
  }

  /**
   * Endpoint de liveness para saber si la app esta viva.
   * HTTP: GET /health/live
   */
  @Get('health/live')
  getLiveness() {
    return this.appService.getLiveness();
  }

  /**
   * Endpoint de readiness para saber si la app esta lista para recibir trafico.
   * HTTP: GET /health/ready
   */
  @Get('health/ready')
  getReadiness() {
    return this.appService.getReadiness();
  }
}
