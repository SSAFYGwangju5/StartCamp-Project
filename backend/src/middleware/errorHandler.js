const notFoundHandler = (req, res) => {
  res.status(404).json({ message: "요청한 API를 찾을 수 없습니다." });
};

const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "서버 오류가 발생했습니다." });
};

module.exports = { notFoundHandler, errorHandler };