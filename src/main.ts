import app from './app';
import http from 'http';
async function start() {
  const expressApp = await app();

  const port = 3001;

  http.createServer(expressApp).listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

start();
