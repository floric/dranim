import { GRAPHQL_ROUTE, main } from './main';
import { get as httpGet, Server } from 'http';
import 'jest';

const ERRNO_KEY = 'errno';
const PORT: number = 8080;

function getFromServer(uri) {
  return new Promise((resolve, reject) => {
    httpGet(`http://localhost:${PORT}${uri}`, res => {
      resolve(res);
    }).on('error', (err: Error) => {
      reject(err);
    });
  });
}

describe('main', () => {
  it('should be able to Initialize a server (production)', () => {
    return main({
      enableCors: false,
      env: 'production',
      port: PORT
    }).then((server: Server) => {
      return server.close();
    });
  });

  it('should be able to Initialize a server (development)', () => {
    return main({
      enableCors: true,
      env: 'dev',
      port: PORT
    }).then((server: Server) => {
      return server.close();
    });
  });

  it('should have a working GET graphql (developemnt)', () => {
    return main({
      enableCors: true,
      env: 'dev',
      port: PORT
    }).then((server: Server) => {
      return getFromServer(GRAPHQL_ROUTE).then((res: any) => {
        server.close();
        // GET without query returns 400
        expect(res.statusCode).toBe(400);
      });
    });
  });

  it('should have a working GET graphql (production)', () => {
    return main({
      enableCors: false,
      env: 'production',
      port: PORT
    }).then((server: Server) => {
      return getFromServer(GRAPHQL_ROUTE).then((res: any) => {
        server.close();
        // GET without query returns 400
        expect(res.statusCode).toBe(400);
      });
    });
  });

  it('should reject twice on same port', () => {
    return main({
      enableCors: false,
      env: 'production',
      port: PORT
    }).then((server: Server) => {
      return main({
        enableCors: false,
        env: 'production',
        port: PORT
      }).then(
        (secondServer: Server) => {
          server.close();
          secondServer.close();
          throw new Error('Was able to listen twice!');
        },
        (err: Error) => {
          server.close();
          expect(err[ERRNO_KEY]).toBe('EADDRINUSE');
        }
      );
    });
  });
});
