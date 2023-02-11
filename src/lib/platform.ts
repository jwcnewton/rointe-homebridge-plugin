
import { HomebridgePlatform } from 'homebridge-framework';
import { Configuration } from './configuration/configuration';
import { RointeController } from './controllers/rointe-controller';
import { RointeApiClient } from './clients/rointe-api-client';
import { ConnectDeviceType } from './clients/models/types';

export class Platform extends HomebridgePlatform<Configuration> {
    private updateHandle: any = null;
    public devices = new Array<ConnectDeviceType>();
    public controllers = new Array<RointeController>();

    public get pluginName(): string {
        return 'homebridge-rointe-unofficial';
    }
    public get platformName(): string {
        return 'Rointe Unofficial';
    }

    private _apiClient: RointeApiClient | null = null;

    public get apiClient(): RointeApiClient {
        if (!this._apiClient) {
            throw new Error('Platform not initialized yet.');
        }
        return this._apiClient;
    }

    public async updateAsync() {
        try {
            for (let controller of this.controllers) {
                await controller.updateAsync();
            }
            this.logger.debug('Rointe device synced from the API.');
        } catch {
            this.logger.warn('Failed Rointe device synced from the API.');
        }
    }

    public async initialize(): Promise<void> {
        this.logger.info(`Initializing platform...`);

        this.configuration.updateInterval = this.configuration.updateInterval || 15;

        // Avoid spamming the Rointe API
        if (this.configuration.updateInterval < 5) {
            this.configuration.updateInterval = 5;
        }

        if (this.configuration.installation_name == null) {
            this.logger.info(`Please set an installation name.`);
        }

        // Initializes the client
        this._apiClient = new RointeApiClient(this);
        await this._apiClient.initialize();

        // Gets all devices
        this.devices = await this.apiClient.getDevicesAsync();

        // Cycles over all configured devices and creates the corresponding controllers
        if (this.devices) {
            for (let device of this.devices) {
                // Creates the new controller for the device and stores it
                const rointeController = new RointeController(this, device);
                this.controllers.push(rointeController);
            }
        } else {
            this.logger.warn(`No devices configured.`);
        }

        this.updateHandle = setInterval(() => this.updateAsync(), this.configuration.updateInterval * 1000);
    }

    public destroy() {
        if (this.updateHandle) {
            clearInterval(this.updateHandle);
            this.updateHandle = null;
        }
    }
}
