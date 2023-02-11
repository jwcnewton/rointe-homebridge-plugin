
import { Platform } from '../platform';
import { Homebridge, Characteristic } from 'homebridge-framework';
import { ConnectDeviceType } from '../clients/models/types';

export class RointeController {
    public device_id: string;
    public name: string;
    private rointeCurrentTemperature: Characteristic<number>;
    private rointeTargetTemperature: Characteristic<number>;
    private rointeTargetCoolingStateChange: Characteristic<number>;
    private rointeDisplayUnit: Characteristic<number>;

    constructor(private platform: Platform, device: ConnectDeviceType) {
        platform.logger.info(`[${device.data.name}] Initializing...`);

        this.device_id = device.device_id;
        this.name = device.data.name;

        // Creates the accessory
        const rointeRadiatorAccessory = platform.useAccessory(device.data.name, device.data.name);
        const rointeRadiatorService = rointeRadiatorAccessory.useService(Homebridge.Services.Thermostat, device.data.name, device.data.name+'thermo');
        
        rointeRadiatorAccessory.setInformation({
            manufacturer: 'Rointe',
            model: 'Radiator',
            serialNumber: device.serialnumber,
            firmwareRevision: device.firmware.firmware_version_device,
            hardwareRevision: device.data.product_version
        });

        this.rointeCurrentTemperature = rointeRadiatorService.useCharacteristic<number>(Homebridge.Characteristics.CurrentTemperature);
        this.rointeTargetTemperature = rointeRadiatorService.useCharacteristic<number>(Homebridge.Characteristics.TargetTemperature);
        this.rointeTargetCoolingStateChange = rointeRadiatorService.useCharacteristic<number>(Homebridge.Characteristics.TargetHeatingCoolingState);
        this.rointeDisplayUnit = rointeRadiatorService.useCharacteristic<number>(Homebridge.Characteristics.TemperatureDisplayUnits)

        this.rointeDisplayUnit.value = Homebridge.Characteristics.TemperatureDisplayUnits.CELSIUS

        this.rointeTargetTemperature.valueChanged = async newValue => { 
            await this.platform.apiClient.setDeviceTempAsync(this.device_id, newValue);
        }

        this.rointeTargetCoolingStateChange.setProperties(<any>{
            validValues: [0, 1]
        });
        
        this.rointeTargetCoolingStateChange.valueChanged = async newValue => {
            let targetTemp: number = this.rointeTargetTemperature.value || device.data.temp;
            await this.platform.apiClient.setDeviceTempAsync(this.device_id, targetTemp, (newValue != 0));
        }
   
        this.update(device);
        platform.logger.info(`[${device.data.name}] Initialized`);
    }

    public async updateAsync() {
        try {
            this.platform.logger.debug(`Syncing Rointe Device with ID ${this.name} from the API...`);
            const device_model = <ConnectDeviceType> await this.platform.apiClient.getDeviceAsync(this.device_id);
            this.update(device_model);
        } catch {
            this.platform.logger.warn(`Failed to sync Rointe Device with ID ${this.device_id} from API.`);
        }
    }

    public update(device: ConnectDeviceType) {
        this.rointeCurrentTemperature.value = device.data.temp;
        this.rointeTargetCoolingStateChange.value = device.data.power ? 1 : 0;
    }
}
