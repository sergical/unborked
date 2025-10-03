import * as Sentry from '@sentry/node';

Sentry.init({
    dsn: "https://636ca7bc1ade096441de27515457333f@o4505994951065600.ingest.us.sentry.io/4510127434432512",
    
    spotlight: process.env.NODE_ENV !== 'production',
    enableLogs: true,

	  debug: true,

    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    profileLifecycle: 'trace',
  });
