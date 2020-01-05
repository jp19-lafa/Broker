// ====================================================== //
// =================== Startup Broker =================== //
// ====================================================== //

import { Broker } from './libs/broker';
import { get as config } from 'config';
import { init as Sentry } from '@sentry/node';
import { version } from './package.json';
import { log } from './libs/logger';

Sentry({
  dsn: config('sentry'),
  environment: process.env.NODE_ENV,
  release: 'farmlab-broker@' + version
});

log.info(`Starting APP (environment: ${process.env.NODE_ENV} | version: farmlab-broker@${version})`)

new Broker();
