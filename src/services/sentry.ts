import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: "https://a2c1df8072092730a7baf2bf0445ab18@o4510707992297472.ingest.de.sentry.io/4510708175929424",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true
});

export { Sentry }
