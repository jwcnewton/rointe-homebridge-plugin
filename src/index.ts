
import { Homebridge } from 'homebridge-framework';
import { Platform } from './lib/platform';

module.exports = Homebridge.register(new Platform());