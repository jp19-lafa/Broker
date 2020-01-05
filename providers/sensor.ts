import got from 'got';
import { get as config } from 'config';
import { log } from '../libs/logger';

export class SensorProvider {

  protected key: string;

  constructor(key: string) {
    this.key = key;
  }

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
        prefixUrl: config('api'),
        json: {
          client,
          sensor,
          payload
        },
        headers: {
          Authorization: `Bearer ${this.key}`
        }
      }).then(data => {
        return resolve(true);
      }).catch(error => {
        return resolve(false)
      });
    });
  }

}