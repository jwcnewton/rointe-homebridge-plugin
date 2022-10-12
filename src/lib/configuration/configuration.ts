
import { DeviceModel } from '../clients/models/device-model';

export interface Configuration {
    username: string;
    password: string;
    installation_name: string;
    devices: Array<DeviceModel>;
    updateInterval: number;
}
