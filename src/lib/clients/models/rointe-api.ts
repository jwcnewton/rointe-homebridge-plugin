export interface RointeApi {
    initialize_authentication(): any,
    get_local_id(): any,
    get_installation_by_name(local_id: string, name: string): any,
    get_all_devices_by_installation_name(local_id: string, name: string): any,
    get_installations(local_id: string): any,
    get_device(device_id: string): any,
    set_device_temp(device_id: string, new_temp: number, power: boolean): any,
    get_latest_energy_stats(device_id: string): any
}