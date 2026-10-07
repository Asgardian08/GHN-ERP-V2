import pg from 'pg';
import crypto from 'node:crypto';

const { Pool } = pg;
const connectionString = (process.env.DATABASE_URL || '').trim();
const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  : null;

const COOKIE_NAME = 'ghn_session';
const SESSION_DAYS = 30;

function parseCookies(req) {
  const raw = req.headers?.cookie || '';
  return raw.split(';').reduce((acc, part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return acc;
    const key = part.slice(0, idx).trim();
    const value = decodeURIComponent(part.slice(idx + 1).trim());
    if (key) acc[key] = value;
    return acc;
  }, {});
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function setSessionCookie(res, token) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
  );
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

function safeUser(user) {
  if (!user) return null;
  const { password, ...withoutPassword } = user;
  return withoutPassword;
}

async function ensureTables() {
  if (!pool) throw new Error('DATABASE_URL belum dikonfigurasi di Vercel.');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ghn_app_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      version BIGINT NOT NULL DEFAULT 1,
      schema JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS ghn_sessions (
      token_hash CHAR(64) PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_ghn_sessions_expires_at ON ghn_sessions(expires_at);
  `);
}

async function getSessionUser(req) {
  if (!pool) return null;
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  const tokenHash = hashToken(token);
  const session = await pool.query(
    'SELECT user_id FROM ghn_sessions WHERE token_hash = $1 AND expires_at > NOW()',
    [tokenHash]
  );
  if (!session.rows[0]) return null;

  const state = await pool.query('SELECT schema FROM ghn_app_state WHERE id = 1');
  if (!state.rows[0]?.schema?.users) {
    // During the very first migration there is no state row yet. The only
    // account allowed to bootstrap the database is the configured Owner.
    if (session.rows[0].user_id === 'usr_owner') {
      return {
        id: 'usr_owner',
        name: 'Septywan Farhan',
        role: 'owner',
        email: String(process.env.GHN_OWNER_EMAIL || 'septywanf@gmail.com').trim().toLowerCase(),
        isActive: true,
        permissions: {
          canAccessDashboard: true,
          canAccessProduksi: true,
          canAccessKasir: true,
          canAccessPreOrder: true,
          canAccessStok: true,
          canAccessPelanggan: true,
          canAccessKeuangan: true,
          canAccessLaporan: true,
          canAccessPengaturan: true,
        },
      };
    }
    return null;
  }
  return state.rows[0].schema.users.find((u) => u.id === session.rows[0].user_id) || null;
}

async function readState() {
  const result = await pool.query('SELECT version, schema, updated_at FROM ghn_app_state WHERE id = 1');
  return result.rows[0] || null;
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  try {
    if (!pool) return sendJson(res, 500, { error: 'DATABASE_URL belum dikonfigurasi di Vercel.' });
    await ensureTables();

    const action = new URL(req.url || '', 'https://ghn.local').searchParams.get('action') || 'state';

    if (req.method === 'POST' && action === 'login') {
      const { email = '', password = '' } = req.body || {};
      const cleanEmail = String(email).trim().toLowerCase();
      const state = await readState();

      let user = null;
      if (state?.schema?.users) {
        user = state.schema.users.find(
          (u) => String(u.email || '').trim().toLowerCase() === cleanEmail
        ) || null;
      } else {
        const bootstrapEmail = String(process.env.GHN_OWNER_EMAIL || 'septywanf@gmail.com').trim().toLowerCase();
        const bootstrapPassword = String(process.env.GHN_OWNER_PASSWORD || 'Farhan234!');
        if (cleanEmail === bootstrapEmail && password === bootstrapPassword) {
          user = {
            id: 'usr_owner',
            name: 'Septywan Farhan',
            role: 'owner',
            email: bootstrapEmail,
            password: bootstrapPassword,
            phone: '+62 812-3456-7890',
            isActive: true,
            permissions: {
              canAccessDashboard: true,
              canAccessProduksi: true,
              canAccessKasir: true,
              canAccessPreOrder: true,
              canAccessStok: true,
              canAccessPelanggan: true,
              canAccessKeuangan: true,
              canAccessLaporan: true,
              canAccessPengaturan: true,
            },
          };
        }
      }

      if (!user || user.isActive === false || user.password !== password) {
        return sendJson(res, 401, { error: 'Email atau kata sandi tidak cocok.' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      await pool.query(
        'INSERT INTO ghn_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'30 days\')',
        [hashToken(token), user.id]
      );
      setSessionCookie(res, token);
      return sendJson(res, 200, { success: true, user: safeUser(user) });
    }

    if (req.method === 'GET' && action === 'session') {
      const user = await getSessionUser(req);
      return sendJson(res, 200, { authenticated: Boolean(user), user: safeUser(user) });
    }

    if (req.method === 'POST' && action === 'logout') {
      const cookies = parseCookies(req);
      if (cookies[COOKIE_NAME]) {
        await pool.query('DELETE FROM ghn_sessions WHERE token_hash = $1', [hashToken(cookies[COOKIE_NAME])]);
      }
      clearSessionCookie(res);
      return sendJson(res, 200, { success: true });
    }

    const user = await getSessionUser(req);
    if (!user) return sendJson(res, 401, { error: 'Sesi login GHN tidak valid atau sudah berakhir.' });

    if (req.method === 'GET' && action === 'state') {
      const state = await readState();
      if (!state) return sendJson(res, 404, { error: 'Database GHN belum diinisialisasi.' });
      return sendJson(res, 200, {
        version: Number(state.version),
        schema: state.schema,
        updatedAt: state.updated_at,
      });
    }

    if (req.method === 'POST' && action === 'state') {
      const existing = await readState();
      if (existing) return sendJson(res, 409, { error: 'Database GHN sudah memiliki data.' });
      const schema = req.body?.schema;
      if (!schema || !Array.isArray(schema.users)) {
        return sendJson(res, 400, { error: 'Data GHN tidak valid.' });
      }
      await pool.query(
        'INSERT INTO ghn_app_state (id, version, schema) VALUES (1, 1, $1::jsonb)',
        [JSON.stringify(schema)]
      );
      return sendJson(res, 201, { success: true, version: 1 });
    }

    if (req.method === 'PUT' && action === 'state') {
      const incomingVersion = Number(req.body?.version || 0);
      const schema = req.body?.schema;
      if (!schema || !Array.isArray(schema.users)) {
        return sendJson(res, 400, { error: 'Data GHN tidak valid.' });
      }
      const updated = await pool.query(
        `UPDATE ghn_app_state
         SET schema = $1::jsonb, version = version + 1, updated_at = NOW()
         WHERE id = 1 AND version = $2
         RETURNING version`,
        [JSON.stringify(schema), incomingVersion]
      );
      if (!updated.rows[0]) {
        const latest = await readState();
        return sendJson(res, 409, { error: 'Data GHN baru saja berubah di perangkat lain.', version: Number(latest?.version || 0) });
      }
      return sendJson(res, 200, { success: true, version: Number(updated.rows[0].version) });
    }

    return sendJson(res, 404, { error: 'Endpoint GHN tidak ditemukan.' });
  } catch (error) {
    console.error('[GHN API]', error);
    return sendJson(res, 500, { error: error?.message || 'Terjadi kesalahan server GHN.' });
  }
}
