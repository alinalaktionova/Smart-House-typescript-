import {Device} from "./Device"
import {DeviceInterface} from "./DeviceInterface"
import {Logger} from "./Logger"

export class iKettle extends Device{
    constructor(nameDevice:string){
        super(nameDevice);
    }
    protected currentMode:number = 0;
    protected maxFullness:number = 1000;
    protected minFullness:number = 100;
    protected currentFullness:number = 0;
    protected currentTemperature:number = 28;

    protected modes: Array<object> = [
        { standard: 100 },
        { tea: 78 },
        { coffee: 85 },
        { porridge: 72 },
        { "baby food": 70 }
    ];
    off(): void{
        super.off();
        this.deleteTimer();
        this.currentTemperature = 26;
    }

    toString(): string {
        return `
            ${super.toString()},
            mode: ${Object.keys(this.modes[this.currentMode])},
            currentFullness: ${this.currentFullness}`
    }
    nextMode(): void{
        if (this.currentMode === this.modes.length - 1) {
            this.currentMode = 0;
        } else {
            this.currentMode++;
        }
    };

    previousMode():void {
        if (this.currentMode === 0) {
            this.currentMode = this.modes.length - 1;
        } else {
            this.currentMode--;
        }
    };

    getCurrentMode(): string{
        return Object.keys(this.modes[this.currentMode])[0];
    };

    addWater(value: number): void {
        let newAmountOfWater = this.currentFullness + value;
        if (
            newAmountOfWater >= this.minFullness &&
            newAmountOfWater <= this.maxFullness
        ) {
            this.currentFullness = newAmountOfWater;
        } else if (newAmountOfWater < this.minFullness) {
            Logger.warning("Please, add more water");
        } else {
            Logger.warning("Please, reduce the amount of water");
        }
    };

    getCurrentFullness(): number{
        return this.currentFullness;
    };

    boilWater(): Promise<void>{
        if (this.isDeviceOn() && this.currentFullness) {
            return new Promise(resolve => {
                this.timer = setInterval(() => {
                    if (
                        this.currentTemperature >= Object.values(this.modes[this.currentMode])[0]
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
    };
}


