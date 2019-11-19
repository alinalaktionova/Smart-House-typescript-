import { Device } from './Device';
import { DeviceInterface } from './DeviceInterface';
import { log } from './Logger';

export class iKettle extends Device {
  protected currentMode: number = 0;
  protected maxFullness: number = 1000;
  protected minFullness: number = 100;
  protected currentFullness: number = 0;
  protected currentTemperature: number = 28;

  protected modes: Array<object> = [
    { standard: 100 },
    { tea: 78 },
    { coffee: 85 },
    { porridge: 72 },
    { 'baby food': 70 }
  ];
  off(): void {
    super.off();
    this.deleteTimer();
    this.currentTemperature = 26;
  }

  toString(): string {
    return `
           ${super.toString()};
           mode: ${this.getCurrentMode()},
           currentFullness: ${this.getCurrentFullness()}`;
  }
  nextMode(): void {
    if (this.currentMode === this.modes.length - 1) {
      this.currentMode = 0;
    } else {
      this.currentMode++;
    }
  }

  previousMode(): void {
    if (this.currentMode === 0) {
      this.currentMode = this.modes.length - 1;
    } else {
      this.currentMode--;
    }
  }

  getCurrentMode(): string {
    return Object.keys(this.modes[this.currentMode])[0];
  }

  addWater(value: number): void {
    let newAmountOfWater = this.currentFullness + value;
    if (
      newAmountOfWater >= this.minFullness &&
      newAmountOfWater <= this.maxFullness
    ) {
      this.currentFullness = newAmountOfWater;
    } else if (newAmountOfWater < this.minFullness) {
      log.warn('Please, add more water');
    } else {
      log.warn('Please, reduce the amount of water');
    }
  }

  getCurrentFullness(): number {
    return this.currentFullness;
  }

  boilWater(): Promise<void> {
    if (this.isDeviceOn() && this.currentFullness) {
      return new Promise(resolve => {
        this.timer = setInterval(() => {
          if (
            this.currentTemperature >=
            Object.values(this.modes[this.currentMode])[0]
          ) {
            resolve();
          } else {
            this.currentTemperature += 2;
            this.currentFullness--;
          }
        }, 1000);
      }).then(() => {
        console.log(this.currentTemperature);
        this.off();
      });
    }
  }
}
