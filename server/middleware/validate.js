const validate = (schema, source = 'body') => (req, _res, next) => {
  const parsed = schema.safeParse(req[source]);
  if (!parsed.success) {
    const error = new Error(parsed.error.issues[0]?.message || 'Invalid request payload');
    error.status = 400;
    return next(error);
  }

  req[source] = parsed.data;
  return next();
};

export default validate;
