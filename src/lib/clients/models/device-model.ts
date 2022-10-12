import { DeviceInfo } from './device-info';
import { DeviceFirmware } from './device-firmware';
import { DeviceStats } from './device-stats';

export interface DeviceModel {
    device_id: string,
    data: DeviceInfo
    firmware: DeviceFirmware,
    installation: string,
    serialnumber: string,
    stats: DeviceStats
}