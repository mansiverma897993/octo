import express from 'express';
import path from 'path';

const app = express();
const port = Number(process.env.PORT || 3000);
const dir = path.resolve('public');

app.use(express.static(dir));
app.get('/health', (_req, res) => res.json({ ok: true, service: 'mdc-web' }));

app.listen(port, () => console.log(`mdc-web on :${port}`));
