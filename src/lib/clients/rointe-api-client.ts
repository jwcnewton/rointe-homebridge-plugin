import { init, login, FirebaseConfig, InstallationsType, getInstallations, InstallationType, getDevice, setDevicePower, updateDeviceTemperature } from "equation-connect";
import { Platform } from '../platform';
import { User } from './models/user';
import { ConnectDeviceType } from './models/types';

export class RointeApiClient {
    private static _instance: RointeApiClient;
    private _rointe_user!: User;

    async initialize() {
        await this.setupRointeApi()
    }

    constructor(private platform: Platform) {
        if (RointeApiClient._instance) {
            return RointeApiClient._instance;
        }

        RointeApiClient._instance = this;
    }

    async getDevicesAsync(): Promise<Array<ConnectDeviceType>> {
        const results: Array<ConnectDeviceType> = []
        try {
            const installations = Array<InstallationsType>(await getInstallations(this._rointe_user.uid));

            const installation = <InstallationType>this.getInstallationByName(installations, this.platform.configuration.installation_name);
            if (installation == null) {
                return results;
            }

            const zone_keys = Object.keys(installation.zones);
            for (let i = 0; i < zone_keys.length; i++) {
                const zone = installation.zones[zone_keys[i]]

                if (zone.devices != null) {
                    const devices = Object.keys(zone.devices);

                    for (let j = 0; j < devices.length; j++) {
                        const device_id = devices[j];
                        const device = await this.getDeviceAsync(device_id);
                        if (device != null) {
                            results.push(device);
                        }

                    }
                }
            }
        } catch (err) {
            if (err instanceof Error) {
                this.platform.logger.error(`Error fetching devices (Stack): ${err.stack}`);
                this.platform.logger.error(`Error fetching devices (Name): ${err.name}`);
            }
            this.platform.logger.error(`Error fetching devices: ${err}`);
        }
        return results
    }


    async getDeviceAsync(device_id: string): Promise<ConnectDeviceType | null> {
        try {
            const device = (await getDevice(device_id))
            return { device_id, ...device };
        } catch (err) {
            this.platform.logger.error(`Error fetching device info: ${err}`);
        }
        return null;
    }

    async setDeviceTempAsync(device_id: string, temp: number, power: boolean = true): Promise<ConnectDeviceType | null> {
        try {
            await setDevicePower(device_id, power);
            await updateDeviceTemperature(device_id, temp);
            const device = (await getDevice(device_id))
            return { device_id, ...device };
        } catch (err) {
            this.platform.logger.error(`Error setting device temp: ${err}`);
        }
        return null;
    }

    async setupRointeApi() {
        if (this._rointe_user == null) {
            this.platform.logger.info(`USE ROINTE = ${this.platform.configuration.useRointeBackend}`);
            if (this.platform.configuration.useRointeBackend) {
                init(FirebaseConfig.RointeConnect);
            } else {
                init(FirebaseConfig.EquationConnect);
            }
            this._rointe_user = await login(this.platform.configuration.username, this.platform.configuration.password);
        }
    }

    getInstallationByName(installations: Array<InstallationsType>, installation_name: String): InstallationType | null {
        var installationsType = null;
        installations.forEach(installation => {
            const installationKeys = Object.keys(installation);
            installationKeys.forEach(installationKey => {
                const _installationType = <InstallationType>installation[installationKey];
                if (_installationType.name == installation_name) {
                    installationsType = _installationType;
                }
            });
        });

        return installationsType;
    }
}