import * as Collections from 'typescript-collections';
import { DeviceInterface } from './DeviceInterface';
import { iKettle } from './iKettle';
import { Speaker } from './Speaker';
import { strict } from 'assert';
import { Device } from './Device';
import { log } from './Logger';
import Dictionary from 'typescript-collections/dist/lib/Dictionary';

export class SmartHouse<T extends DeviceInterface> {
  protected devices = new Collections.Dictionary<string, T>();
  constructor(protected name: string) {
    this.name = name;
  }

  private _checkName(name: string): boolean {
    name = name.trim();
    const regex = /[\w\d\s]{5,10}/;
    if (!regex.test(name)) {
      log.warn('Name must include more than 5 characters');
      return false;
    } else {
      return true;
    }
  }
  onAll(): void {
    for (let val of this.devices.values()) {
      val.on();
    }
  }
  offAll(): void {
    for (let val of this.devices.values()) {
      val.off();
    }
  }

  deleteAllDevices() {
    this.offAll();
    this.devices.clear();
  }

  getDeviceByName(name: string): T | null {
    if (this.devices.containsKey(name)) {
      return this.devices.getValue(name);
    }
    log.warn('There is no device with this name');
    return null;
  }
  getAllDevicesByModel(model: Function): Array<T> {
    let resultDevices: Array<T> = [];
    for (let val of this.devices.values()) {
      if (val instanceof model) {
        resultDevices.push(val);
      }
    }
    return resultDevices;
  }

  deleteDevicesByModel(model: Function): void {
    for (let key of this.devices.keys()) {
      if (this.devices.getValue(key) instanceof model) {
        this.devices.remove(key);
      }
    }
  }

  private _isNameUnique(name: string): boolean {
    return !this.devices.containsKey(name);
  }

  getName(): string {
    return this.name;
  }

  addDevice(obj: T): void {
    if (this._isNameUnique(obj.getName())) {
      this.devices.setValue(obj.getName(), obj);
    }
  }

  deleteDeviceByName(name: string): void {
    this.devices.remove(name);
  }
  getAllDevices(): Dictionary<string, T> {
    return this.devices;
  }
}
