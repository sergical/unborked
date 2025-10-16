import * as Sentry from '@sentry/node';

Sentry.init({
    dsn: process.env.SENTRY_DSN,

    spotlight: false,
    enableLogs: true,

	  debug: false,

    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    profileLifecycle: 'trace',
  });
