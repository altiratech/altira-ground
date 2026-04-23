import { createApp } from './app';

const app = createApp();

export default {
  fetch(request: Request, env: import('./app').Bindings, executionCtx: ExecutionContext) {
    return app.fetch(request, env, executionCtx);
  },
};
