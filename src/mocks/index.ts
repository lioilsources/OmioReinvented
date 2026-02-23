export async function bootstrapMocks() {
  if (__DEV__) {
    require('fast-text-encoding');
    require('react-native-url-polyfill/auto');

    const { startMockServer } = require('./server');
    startMockServer();
    console.log('[MSW] Mock server started');
  }
}
