export async function bootstrapMocks() {
  if (__DEV__) {
    // Polyfills must be imported before msw/native
    require('fast-text-encoding');
    require('react-native-url-polyfill/auto');

    const { server } = require('./server');
    server.listen({ onUnhandledRequest: 'bypass' });
    console.log('[MSW] Mock server started');
  }
}
