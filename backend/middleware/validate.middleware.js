/**
 * Factory creating middleware to validate req.body or req.query against a Zod schema.
 */
export function validate(schema, source = "body") {
  return (req, res, next) => {
    const dataToValidate = source === "query" ? req.query : req.body;
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed.",
          details,
        },
      });
    }

    if (source === "query") {
      req.query = result.data;
    } else {
      req.body = result.data;
    }

    next();
  };
}

export default validate;
