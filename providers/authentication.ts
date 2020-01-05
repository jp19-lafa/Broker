import got from 'got';
import { get as config } from 'config';
import { log } from '../libs/logger';

export class AuthenticationProvider {

  protected key: string;

  constructor(key: string) {
    this.key = key;
  }

  /**
   * Check whether a client is allowed to connect
   * @param clientId The client's UID
   * @param username The client's Username
   * @param key The client's Authorization Key
   */
  async isAllowedToConnect(clientId: string, username: string, key: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      log.debug(`Authorization Request for ${clientId}`);
      if(!clientId || !username || !key) return resolve(false);
      if (clientId !== username && !username.includes('core-server')) return resolve(false);
      got.post(`mqtt/authenticate`, {
        prefixUrl: config('api'),
        json: {
          client: clientId,
          key: key.toString()
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