import { ConnectDeviceType } from '../clients/models/types';

export interface Configuration {
    username: string;
    password: string;
    installation_name: string;
    devices: Array<ConnectDeviceType>;
    updateInterval: number;
    useRointeBackend: string;
}
