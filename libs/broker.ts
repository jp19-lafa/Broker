import { Server, Client, Packet } from 'mosca';
import { get as config } from 'config';
import { log } from './logger';

// Providers
import { AuthenticationProvider } from '../providers/authentication';
import { StatusProvider } from '../providers/status';
import { SensorProvider } from '../providers/sensor';
import { KeyProvider } from '../providers/key';

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
  protected authProvider: AuthenticationProvider;
  protected statusProvider: StatusProvider;
  protected sensorProvider: SensorProvider;

  constructor() {
    const key = new KeyProvider().generateInternalToken();
    this.authProvider = new AuthenticationProvider(key);
    this.statusProvider = new StatusProvider(key);
    this.sensorProvider = new SensorProvider(key);

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

  // farmlab/AA:AA:AA/sensor/lightint

  protected published = (packet: Packet, client: Client) => {
    if (!this.isValidFarmUpdate(packet.topic)) return;
    switch (this.getIOTypeFromTopic(packet.topic)) {
      case 'sensor':
        this.sensorProvider.updateSensorValue(client.id, packet.topic.split('/')[3], packet.payload.toString())
        break;
      case 'actuator':
        log.debug(`Actuator Update Request for ${client.id} / Actuator ${packet.topic.split('/')[3]} to ${packet.payload.toString()}`);
        break;
    }
  }

  protected ready() {
    log.info(`MQTT Server (PORT: ${settings.port})`);
  }

  protected authenticate = async (client: Client, username: string, password: string, callback: (obj: any, authenticated: boolean) => void) => {
    log.debug(`Connection Attempt by ${client.id}`);
    const authorized: boolean = await this.authProvider.isAllowedToConnect(client.id, username, password);
    if (!authorized) log.debug(`Connection Failed for ${client.id} (UNAUTHORIZED)`);
    callback(null, authorized);
  }

  protected authorizePublish = async (client: Client, topic: string, payload: string, callback: (obj: any, authenticated: boolean) => void) => {
    const authorized: boolean = ((this.isValidFarmUpdate(topic) && this.getClientFromTopic(topic) === client.id) || this.isServer(client.id));
    callback(null, authorized);
  }

  protected authorizeSubscribe = async (client: Client, topic: string, callback: (obj: any, authenticated: boolean) => void) => {
    const authorized: boolean = (this.getClientFromTopic(topic) === client.id || this.isServer(client.id));
    callback(null, authorized);
  }

  protected isNode(client: string) {
    return new RegExp('^([0-9A-F]{2}[:]){5}([0-9A-F]{2})$').test(client);
  }

  protected isServer(client: string) {
    return client.includes('core-server');
  }

  protected isValidFarmUpdate(topic: string) {
    if(topic.split('/').length !== 4) return false;
    if(topic.split('/')[0] !== 'farmlab') return false;
    if(!this.isNode(topic.split('/')[1])) return false;
    if(topic.split('/')[2] !== 'sensor' && topic.split('/')[2] !== 'actuator') return false;
    return true;
  }

  protected getClientFromTopic(topic: string) {
    return topic.split('/')[1];
  }

  protected getIOTypeFromTopic(topic: string) {
    return topic.split('/')[2];
  }

}