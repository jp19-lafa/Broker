import { readFileSync } from 'fs';
import { sign } from 'jsonwebtoken';

export class KeyProvider {

  private privateKey: Buffer = readFileSync('keys/private.key');

  constructor() {
  }

  /**
   * Generate an internal token to communicate with the API
   */
  generateInternalToken() {
    return sign(
      {
        aud: 'farmlab.team',
        iss: 'mqtt.farmlab.team',
        sub: 'mqtt',
        email: 'mqtt@farmlab.team'
      },
      this.privateKey
    );
  }

}