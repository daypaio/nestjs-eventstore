export default {
  connectionSettings: {
    defaultUserCredentials: {
      username: process.env.EVENT_STORE_USERNAME,
      password: process.env.EVENT_STORE_PASSWORD,
    },
  },
  tcpEndpoint: {
    host: process.env.EVENT_STORE_TCP_HOST || 'localhost',
    port: process.env.EVENT_STORE_TCP_PORT || 1113,
  },
};
