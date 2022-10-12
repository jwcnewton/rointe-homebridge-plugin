const api = require("rointe-sdk");
import { Platform } from '../platform';
import { Device } from './models/device';
import { DeviceModel } from './models/device-model';
import { RointeApi } from './models/rointe-api';

export class RointeApiClient {
    private static _instance: RointeApiClient;
    private _rointe_api!: RointeApi;

    async initialize() {
        await this.setupRointeApi()
    }

    constructor(private platform: Platform) {
        if (RointeApiClient._instance) {
            return RointeApiClient._instance;
        }

        RointeApiClient._instance = this;
    }

    async getDevicesAsync(): Promise<Array<DeviceModel>> {
        const localId = (await this._rointe_api.get_local_id()).data;
        const devices = <Array<Device>>(await this._rointe_api.get_all_devices_by_installation_name(localId,
            this.platform.configuration.installation_name)).data

        const results: Array<DeviceModel> = []
        for (let device of devices) {
            const device_model = <DeviceModel>(await this._rointe_api.get_device(device.device_id)).data
            device_model.device_id = device.device_id;
            results.push(device_model)
        }
        return results
    }

    async getDeviceAsync(device_id: string): Promise<DeviceModel> {
        await this.setupRointeApi();
        return (await this._rointe_api.get_device(device_id)).data;
    }

    async setDeviceTempAsync(device_id: string, temp: number, power: boolean = true): Promise<DeviceModel> {
        await this.setupRointeApi();
        return (await this._rointe_api.set_device_temp(device_id, temp, power)).data;
    }

    async setupRointeApi() {
        if (this._rointe_api == null) {
            this._rointe_api = <RointeApi>new api(this.platform.configuration.username, this.platform.configuration.password);
            await this._rointe_api.initialize_authentication();
        }
    }
}