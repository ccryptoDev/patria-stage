class ErrorHandler extends Error {
  constructor(statusCode, message, underwritingStatus, context = {}) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.underwritingStatus = underwritingStatus;
    this.context = context;
  }
}

const SendError = (err, res) => {
  try {
    const message = err.message || "Internal Server Error";
    const statusCode = err.statusCode || 500;
    const underwritingStatus = err.underwritingStatus;
    const context = err.context;
    return res.status(statusCode).json({
      error: message, 
      statusCode: statusCode,
      ok: false,
      underwritingStatus,
      context,
    });
  } catch (error) {
    console.log("Errrorr", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", statusCode: 500, ok: false });
  } finally {
    sails.log.error("ERROR::", err);
  }
};

module.exports = {
  ErrorHandler,
  SendError,
};
