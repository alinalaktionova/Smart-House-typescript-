import {SmartHouse} from "./SmartHouse";
import {Device} from "./Device";
import {Logger} from "./Logger"
import {DeviceInterface} from "./DeviceInterface";
import {iKettle} from "./iKettle";
import {Speaker} from "./Speaker";

declare global {
    interface Window {
        sh: object;
        Speaker: Function;
        iKettle: Function;
    }
}

window.sh = new SmartHouse<Device>('Smart House');

window.Speaker = Speaker;
window.iKettle = iKettle;
