export interface MediaDevice {
  label: string;
  deviceId: string;
}

export interface DeviceState {
  mics: MediaDevice[];
  speakers: MediaDevice[];
  cameras: MediaDevice[];
}
