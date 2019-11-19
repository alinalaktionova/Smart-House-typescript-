import { DeviceInterface } from './DeviceInterface';
import { log } from './Logger';

abstract class Device implements DeviceInterface {
  protected state: boolean = false;
  protected timer: NodeJS.Timeout;
  protected constructor(protected name: string) {
    this.name = name;
  }

  on(): void {
    this.state = true;
  }

  off(): void {
    this.state = false;
  }
  toString(): string {
    return `
            name: ${this.getName()},
            status: ${this.getState()},
            `;
  }

  getName(): string {
    return this.name;
  }

  getState(): boolean {
    return this.state;
  }

  setName(name: string): void {
    if (this.checkNameValidity(name)) {
      this.name = name;
    }
  }

  protected isDeviceOn(): boolean {
    return this.state !== false;
  }

  protected checkNameValidity(name: string): boolean {
    name = name.trim();
    const regex: RegExp = /[\w\d\s]{5,10}/;
    if (!regex.test(name)) {
      log.error('Name must include more than 5 characters');
      return false;
    }
    return true;
  }

  protected deleteTimer(): void {
    clearInterval(this.timer);
  }
}
export { Device };
