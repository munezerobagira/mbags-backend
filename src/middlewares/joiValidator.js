export default function joiValidator(schema) {
  return async function (request, response, next) {
    try {
      const { value, error } = await schema.validate(request.body, {
        abortEarly: false,
      });
      if (error)
        return response.status(400).json({
          errors: error,
        });
      request.body = value;
      next();
    } catch (error) {
      return response.status(500).json({
        status: 500,
        error: error.name,
      });
    }
  };
}
