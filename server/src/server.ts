import app from "./app";
import { env } from "./config/env";
import { initSocket } from "./lib/socket";
import http from 'http'

const server = http.createServer(app)
initSocket(server)


server.listen(env.PORT, () => {
  console.log(`Server running on ${env.PORT}`);
});
