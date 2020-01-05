// ====================================================== //
// =================== Startup Broker =================== //
// ====================================================== //

import { Broker } from './libs/broker';
import { get as config } from 'config';
import { init as Sentry } from '@sentry/node';

Sentry({
  dsn: config('sentry'),
  environment: process.env.NODE_ENV || 'development',
  release: 'farmlab-broker@' + process.env.npm_package_version
});

new Broker();
