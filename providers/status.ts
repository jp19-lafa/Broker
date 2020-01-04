import got from 'got';
import { get as config } from 'config';
import { log } from '../libs/logger';

export class StatusProvider {

  protected key: string;

  constructor(key: string) {
    this.key = key;
  }

  /**
   * Change the status of a node
   * @param client The client's MAC Address
   * @param status The client status (online/offline)
   */
  async updateStatus(client: string, status: boolean): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      log.debug(`Status Request for ${client} / Status to ${status ? 'online' : 'offline' }`);
      got.post(`mqtt/status`, {
        prefixUrl: config('api'),
        json: {
          client,
          status
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

  /**
   * Reset the status of all nodes
   */
  async resetStatus(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      log.debug(`Status Request RESET`);
      got.post(`mqtt/status/reset`, {
        prefixUrl: config('api'),
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