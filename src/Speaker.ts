import {Device} from "./Device"
import {DeviceInterface} from "./DeviceInterface";
import {Logger} from "./Logger";

export class Speaker extends Device{
    protected playbackState:boolean = false;
    protected volumeMin:number = 0;
    protected volumeMax:number = 10;
    protected currentVolume:number = 5;
    protected currentTimerValue:number = 0;
    protected currentTrack:number = 0;
    protected trackList: Array<object> = [
        {
            name: "Song 1",
            duration: 8
        },
        {
            name: "Song 2",
            duration: 10
        },
        {
            name: "Song 3",
            duration: 5
        },
        {
            name: "Song 4",
            duration: 13
        },
        {
            name: "Song 5",
            duration: 10
        }
    ];

    constructor(nameDevice:string) {
        super(nameDevice);
    }

    off(): void{
    if (this.isDeviceOn()) {
        this.togglePlaybackStatus(false);
        this.currentTimerValue = 0;
        this.currentTrack = 0;
        this.currentVolume = 5;
        super.off();
    }
};

// log info about current device state
toString(): string{
    return `
        ${super.toString()},
        volume: ${this.currentVolume},
        playing: ${this.playbackState ? "Play" : "Pause"},
        currentSong: ${Object.keys(this.trackList[this.currentTrack])[0]},
        songDuration: ${Object.keys(this.trackList[this.currentTrack])[1]}s,
        currentTime: ${this.currentTimerValue}s
`;
};

// turn device to play/pause modes
togglePlaybackStatus(status: boolean): void {
    if (this.isDeviceOn()) {
        if (arguments.length) {
            this.playbackState = status;
        } else {
            this.playbackState = !this.playbackState;
        }
        if (this.playbackState) {
            this._startPlaying(this.currentTimerValue);
        } else {
            this._stopPlaying();
        }
    }
};

private _stopPlaying():void{
    if (this.isDeviceOn()) {
       this.deleteTimer();
    }
};

private _startPlaying(playSongFrom: number): void{
    if (this.isDeviceOn() && this._isDeviceInPlayingModeNow()) {
        let count = playSongFrom;

        let tic = function () {
            if (count >= Object.values(this.trackList[this.currentTrack])[1]) {
                this.toggleTrack("next");
            } else {
                count++;
                this.currentTimerValue = count;
            }
        };

        this.timer = setInterval(tic.bind(this), 1000);
    }
}
getPlayPauseState(): boolean{
    return this.playbackState;
};

nextTrack(): void {
    if (this.currentTrack < this.trackList.length - 1) {
        this.currentTrack++;
    } else {
        this.currentTrack = 0;
    }
};

previousTrack(): void {
    if (this.currentTrack > 0) {
        this.currentTrack--;
    } else {
        this.currentTrack = this.trackList.length - 1;
    }
};
rewindForward(time: number): void{
    if (
        this.currentTimerValue + time <
        Object.values(this.trackList[this.currentTrack])[1]
    ) {
        this._stopPlaying();
        this._startPlaying(this.currentTimerValue + time);
    } else {
        this.nextTrack();
    }
};

rewindBack(time:number): void{
    this._stopPlaying();
    if (this.currentTimerValue - time > 0) {
        this._startPlaying(this.currentTimerValue - time);
    } else {
        this.nextTrack();
    }
};
increaseVolume(): void {
    if (this.isDeviceOn()) {
        if (this.currentVolume < this.volumeMax) {
            this.currentVolume++;
        }
    }
};

decreaseVolume(): void {
    if (this.isDeviceOn()) {
        if (this.currentVolume > this.volumeMin) {
            this.currentVolume--;
        }
    }
};

private _isDeviceInPlayingModeNow(): boolean {
    if (!this.playbackState) {
        Logger.warning(
           "Toggle device to playing mode before starting this operation"
        );
        return false;
    }
    return true;
};
}
