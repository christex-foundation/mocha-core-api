//@ts-check
/**
 * Middleware to authenticate requests using an admin key.
 */
export const adminAuth = async (c, next) => {
  const adminKey = c.req.header('X-Admin-Key');

  if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
    console.log('Unauthorized access attempt');
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await next();
};
