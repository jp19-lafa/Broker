import { Server, Client, Packet } from 'mosca';

var settings = {
  port: 1883,
  backend: {
    type: 'mongo',
    url: 'mongodb://database:27017/mqtt',
    pubsubCollection: 'ascoltatori',
    mongo: {}
  }
};

export class Broker {

  protected server: Server;

  constructor() {
    this.server = new Server(settings);
    this.registerCallbacks();
    this.registerAuth();
  }

  protected registerCallbacks() {
    this.server.on('clientConnected', this.clientConnected);
    this.server.on('clientDisconnected', this.clientDisconnected);
    this.server.on('published', this.published);
    this.server.on('ready', this.ready);
  }

  protected registerAuth() {
    this.server.authenticate = this.authenticate;
    this.server.authorizePublish = this.authorizePublish;
    this.server.authorizeSubscribe = this.authorizeSubscribe;
  }

  protected clientConnected(client: Client) { }

  protected clientDisconnected(client: Client) { }

  protected published(packet: Packet, client: Client) { }

  protected ready() {
    console.log(`MQTT Server running on internal port ${settings.port}`);
  }

  protected authenticate(client: Client, username: string, password: string, callback: (obj: any, authenticated: boolean) => void) {
    const authenticated = (username === 'aquadeep_dev' && password.toString() === 'P9ae5Xp0VuCLs26dYeY8UyG8BMXJFYRW');
    callback(null, authenticated);
  }
  protected authorizePublish(client: Client, topic: string, payload: string, callback: (obj: any, authenticated: boolean) => void) {
    callback(null, true);
  }
  protected authorizeSubscribe = function (client: Client, topic: string, callback: (obj: any, authenticated: boolean) => void) {
    callback(null, true);
  }

  public Listen() { }

}