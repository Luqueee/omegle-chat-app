// convex/convex.config.ts
import { defineApp } from 'convex/server';
import r2 from '@convex-dev/r2/convex.config.js';
import presence from '@convex-dev/presence/convex.config.js';

const app = defineApp();
app.use(r2);
app.use(presence);

export default app;
