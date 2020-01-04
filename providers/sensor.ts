import got from 'got';
import { get as config } from 'config';
import { log } from '../libs/logger';
import { Packet, Client } from 'mosca';

export class SensorProvider {

  constructor() {}

  /**
   * Change the status of a node
   * @param client The client's MAC Address
   * @param sensor The sensor type
   * @param payload The sensor value
   */
  async updateSensorValue(client: string, sensor: string, payload: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      log.debug(`Sensor Update Request for ${client} / Sensor ${sensor} to ${payload}`);
      got.post(`mqtt/sensor`, {
        prefixUrl: config('api.url'),
        json: {
          client,
          sensor,
          payload
        },
        headers: {
          Authorization: `Bearer ${config('api.key')}`
        }
      }).then(data => {
        return resolve(true);
      }).catch(error => {
        return resolve(false)
      });
    });
  }

}

export interface IODevice {
  type: IOType;
  name: string;
}

export enum IOType {
  sensor = 'sensor',
  actuator = 'actuator'
}

export interface IOUpdate {
  device: IODevice,
  packet: Packet,
  client: Client
}