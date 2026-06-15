const notFound = (req, res) => {
  res.status(404).json({
    message: "Ruta no encontrada",
  });
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const status = error.status || 500;

  if (status >= 500) {
    console.error(error);
  }

  return res.status(status).json({
    message: error.message || "Error interno del servidor",
    ...(error.details ? { details: error.details } : {}),
  });
};

module.exports = {
  notFound,
  errorHandler,
};
