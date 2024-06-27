export const errorHandler = (err, c) => {
  console.error('Error:', err.name);

  if (err.name === 'ValidationError') {
    return c.json({ success: false, message: err.message }, 400);
  }

  if (err.name === 'NotFoundError') {
    return c.json({ success: false, message: err.message }, 404);
  }

  if (err.name === 'DatabaseError') {
    return c.json(
      { success: false, message: 'An error occurred while processing your request' },
      500,
    );
  }

  return c.json({ success: false, message: 'An unexpected error occurred' }, 500);
};
