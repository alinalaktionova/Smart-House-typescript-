export interface DeviceInterface {
    getState(): boolean;
    getName(): string;
    setName(name: string): void;
    on(): void;
    off(): void;
}