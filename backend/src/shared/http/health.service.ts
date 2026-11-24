import { obterDataReferenciaServidor } from '../date/server-date.js';

export interface HealthStatusDTO {
  status: 'ok';
  serverDate: string;
}

export class HealthService {
  public getHealthStatus(): HealthStatusDTO {
    return {
      status: 'ok',
      serverDate: obterDataReferenciaServidor(),
    };
  }
}
