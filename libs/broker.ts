import { Server, Client, Packet } from 'mosca';
import { get as config } from 'config';
import { log } from './logger';

// Providers
import { AuthenticationProvider } from '../providers/authentication';
import { StatusProvider } from '../providers/status';

const settings = {
  port: <number>config('port'),
  backend: {
    type: 'mongo',
    url: <string>config('database'),
    pubsubCollection: 'ascoltatori',
    mongo: {}
  }
};

export class Broker {

  protected server!: Server;
  protected authProvider = new AuthenticationProvider();
  protected statusProvider = new StatusProvider();

  constructor() {
    this.statusProvider.resetStatus().then(() => {
      this.server = new Server(settings);
      this.registerCallbacks();
      this.registerAuth();
    });
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

  protected clientConnected = (client: Client) => {
    if (this.isNode(client.id)) {
      log.info(`Client Connected: ${client.id}`);
      this.statusProvider.updateStatus(client.id, true);
    } else {
      log.info(`Server Connected: ${client.id}`);
    }
  }

  protected clientDisconnected = (client: Client) => {
    if (this.isNode(client.id)) {
      log.info(`Client Disconnected: ${client.id}`);
      this.statusProvider.updateStatus(client.id, false);
    } else {
      log.info(`Server Disconnected: ${client.id}`);
    }
  }

  protected published = (packet: Packet, client: Client) => { }

  protected ready() {
    log.info(`MQTT Server (PORT ${settings.port}/INTERNAL)`);
  }

  protected authenticate = async (client: Client, username: string, password: string, callback: (obj: any, authenticated: boolean) => void) => {
    log.debug(`Connection Attempt by ${client.id}`);
    const authorized: boolean = await this.authProvider.isAllowedToConnect(client.id, username, password.toString());
    if (!authorized) log.debug(`Connection Failed for ${client.id} (UNAUTHORIZED)`);
    callback(null, authorized);
  }
  protected authorizePublish = async (client: Client, topic: string, payload: string, callback: (obj: any, authenticated: boolean) => void) => {
    const authorized: boolean = (topic.split('/').length === 3 && topic.split('/')[0] === client.id);
    callback(null, authorized);
  }
  protected authorizeSubscribe = async (client: Client, topic: string, callback: (obj: any, authenticated: boolean) => void) => {
    const authorized: boolean = (topic.split('/')[0] === client.id || client.id.includes('core-server'));
    callback(null, authorized);
  }

  protected isNode(client: string) {
    return new RegExp('^([0-9A-F]{2}[:]){5}([0-9A-F]{2})$').test(client);
  }

  protected isServer(client: string) {
    return client.includes('core-server');
  }

  public Listen() { }

}