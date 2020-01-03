import { Server, Client, Packet } from 'mosca';
import { get as config } from 'config';

var settings = {
  port: <number>config('port'),
  backend: {
    type: 'mongo',
    url: <string>config('database'),
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

  protected clientConnected(client: Client) {
    console.log('Client Connected', client);
  }

  protected clientDisconnected(client: Client) { }

  protected published(packet: Packet, client: Client) { }

  protected ready() {
    console.log(`MQTT Server running on internal port ${settings.port}`);
  }

  protected authenticate(client: Client, username: string, password: string, callback: (obj: any, authenticated: boolean) => void) {
    const authenticated = (username === 'farmlab' && password.toString() === 'ThisIsATestPasswordThatWeShouldChangeASAP');
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