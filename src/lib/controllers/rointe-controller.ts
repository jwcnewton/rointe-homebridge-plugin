
import { Platform } from '../platform';
import { DeviceModel } from '../clients/models/device-model';
import { Homebridge, Characteristic } from 'homebridge-framework';

export class RointeController {
    public device_id: string;
    public name: string;
    private rointeCurrentTemperature: Characteristic<number>;
    private rointeTargetTemperature: Characteristic<number>;
    private rointeCurrentCoolingStateChange: Characteristic<number>;
    private rointeTargetCoolingStateChange: Characteristic<number>;
    private rointeDisplayUnit: Characteristic<number>;

    constructor(private platform: Platform, device: DeviceModel) {
        platform.logger.info(`[${device.data.name}] Initializing...`);

        this.device_id = device.device_id;
        this.name = device.data.name;

        // Creates the accessory
        const rointeRadiatorAccessory = platform.useAccessory(device.data.name, device.data.name);
        const rointeRadiatorService = rointeRadiatorAccessory.useService(Homebridge.Services.Thermostat, device.data.name);

        rointeRadiatorAccessory.setInformation({
            manufacturer: 'Rointe',
            model: 'Radiator',
            serialNumber: device.serialnumber,
            firmwareRevision: device.firmware.firmware_version_device,
            hardwareRevision: device.data.product_version
        });

        this.rointeCurrentTemperature = rointeRadiatorService.useCharacteristic<number>(Homebridge.Characteristics.CurrentTemperature);
        this.rointeTargetTemperature = rointeRadiatorService.useCharacteristic<number>(Homebridge.Characteristics.TargetTemperature);
        this.rointeCurrentCoolingStateChange = rointeRadiatorService.useCharacteristic<number>(Homebridge.Characteristics.CurrentHeatingCoolingState);
        this.rointeTargetCoolingStateChange = rointeRadiatorService.useCharacteristic<number>(Homebridge.Characteristics.TargetHeatingCoolingState);

        this.rointeDisplayUnit = rointeRadiatorService.useCharacteristic<number>(Homebridge.Characteristics.TemperatureDisplayUnits)

        this.rointeDisplayUnit.value = Homebridge.Characteristics.TemperatureDisplayUnits.CELSIUS

        this.rointeTargetTemperature.valueChanged = async newValue => { 
            await this.platform.apiClient.setDeviceTempAsync(this.device_id, newValue);
        }

        this.rointeCurrentCoolingStateChange.valueChanged = async newValue => {
            console.log(newValue); // TODO: Add quick state
        }

        this.rointeTargetCoolingStateChange.valueChanged = async newValue => {
            console.log(newValue); // TODO: Add quick state
        }
        
        this.update(device);
        platform.logger.info(`[${device.data.name}] Initialized`);
    }

    public async updateAsync() {
        try {
            this.platform.logger.debug(`Syncing Rointe Device with ID ${this.name} from the API...`);
            const device_model = <DeviceModel> await this.platform.apiClient.getDeviceAsync(this.device_id);
            this.update(device_model);
        } catch (e) {
            this.platform.logger.warn(`Failed to sync Rointe Device with ID ${this.device_id} from API.`);
        }
    }

    public update(device: DeviceModel) {
        this.rointeCurrentTemperature.value = device.data.temp;
    }
}
