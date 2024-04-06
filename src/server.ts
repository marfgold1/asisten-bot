import fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import { installRouter } from './router';

async function build() {
  const app = fastify();
  app.register(helmet);
  app.register(cors);

  await installRouter(app);
  return app;
}

const app = await build();
// Start the server
app.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Server listening on port 3000');
});
