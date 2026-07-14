const db = require("../db");

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const isValidId = (value) => Number.isInteger(value) && value > 0;
const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
};

const validatePostBody = ({ title, content, password }) => {
  if (!isNonEmptyString(title)) {
    return { status: 400, message: "제목은 필수입니다." };
  }

  if (title.trim().length > 200) {
    return { status: 400, message: "제목은 200자 이하로 작성해야 합니다." };
  }

  if (!isNonEmptyString(content)) {
    return { status: 400, message: "내용은 필수입니다." };
  }

  if (!isNonEmptyString(password)) {
    return { status: 400, message: "비밀번호는 필수입니다." };
  }

  if (password.trim().length > 100) {
    return { status: 400, message: "비밀번호는 100자 이하로 작성해야 합니다." };
  }

  return null;
};

const buildPostResponse = (row) => {
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category || null,
    view_count: row.view_count,
    like_count: row.like_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

const getPosts = (req, res, next) => {
  const { keyword, category } = req.query;
  const page = parsePositiveInt(req.query.page, 1);
  const limit = parsePositiveInt(req.query.limit, 10);
  const offset = (page - 1) * limit;

  const filters = [];
  const params = [];

  if (isNonEmptyString(keyword)) {
    filters.push("(title LIKE ? OR content LIKE ?)");
    const pattern = `%${keyword.trim()}%`;
    params.push(pattern, pattern);
  }

  if (isNonEmptyString(category)) {
    filters.push("category = ?");
    params.push(category.trim());
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  db.get(
    `SELECT COUNT(*) AS total FROM posts ${whereClause}`,
    params,
    (countError, countRow) => {
      if (countError) {
        console.error(countError);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
      }

      const total = countRow?.total || 0;
      const totalPages = Math.max(1, Math.ceil(total / limit));

      db.all(
        `
        SELECT
          id,
          title,
          content,
          category,
          view_count,
          like_count,
          created_at,
          updated_at
        FROM posts
        ${whereClause}
        ORDER BY id DESC
        LIMIT ?
        OFFSET ?
        `,
        [...params, limit, offset],
        (error, rows) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ message: "서버 오류가 발생했습니다." });
          }

          res.json({
            posts: rows.map(buildPostResponse),
            pagination: {
              page,
              limit,
              total,
              totalPages,
            },
          });
        }
      );
    }
  );
};

const getPostById = (req, res, next) => {
  const id = Number(req.params.id);

  if (!isValidId(id)) {
    return res.status(400).json({ message: "잘못된 게시글 ID입니다." });
  }

  db.run(
    `
    UPDATE posts
    SET view_count = view_count + 1
    WHERE id = ?
    `,
    [id],
    function (updateError) {
      if (updateError) {
        console.error(updateError);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
      }

      db.get(
        `
        SELECT
          id,
          title,
          content,
          category,
          view_count,
          like_count,
          created_at,
          updated_at
        FROM posts
        WHERE id = ?
        `,
        [id],
        (error, row) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ message: "서버 오류가 발생했습니다." });
          }

          res.json(buildPostResponse(row));
        }
      );
    }
  );
};

const createPost = (req, res, next) => {
  const { title, content, password, category } = req.body;
  const validationError = validatePostBody({ title, content, password });

  if (validationError) {
    return res.status(validationError.status).json({ message: validationError.message });
  }

  db.run(
    `
    INSERT INTO posts (title, content, password, category)
    VALUES (?, ?, ?, ?)
    `,
    [title.trim(), content.trim(), password.trim(), isNonEmptyString(category) ? category.trim() : null],
    function (error) {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
      }

      db.get(
        `
        SELECT
          id,
          title,
          content,
          category,
          view_count,
          like_count,
          created_at,
          updated_at
        FROM posts
        WHERE id = ?
        `,
        [this.lastID],
        (selectError, row) => {
          if (selectError) {
            console.error(selectError);
            return res.status(500).json({ message: "서버 오류가 발생했습니다." });
          }

          res.status(201).json(buildPostResponse(row));
        }
      );
    }
  );
};

const updatePost = (req, res, next) => {
  const id = Number(req.params.id);
  const { title, content, password, category } = req.body;

  if (!isValidId(id)) {
    return res.status(400).json({ message: "잘못된 게시글 ID입니다." });
  }

  const validationError = validatePostBody({ title, content, password });
  if (validationError) {
    return res.status(validationError.status).json({ message: validationError.message });
  }

  db.get(
    `SELECT password FROM posts WHERE id = ?`,
    [id],
    (error, row) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
      }

      if (!row) {
        return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
      }

      if (row.password !== password.trim()) {
        return res.status(403).json({ message: "비밀번호가 일치하지 않습니다." });
      }

      db.run(
        `
        UPDATE posts
        SET title = ?, content = ?, category = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [title.trim(), content.trim(), isNonEmptyString(category) ? category.trim() : null, id],
        function (updateError) {
          if (updateError) {
            console.error(updateError);
            return res.status(500).json({ message: "서버 오류가 발생했습니다." });
          }

          db.get(
            `
            SELECT
              id,
              title,
              content,
              category,
              view_count,
              like_count,
              created_at,
              updated_at
            FROM posts
            WHERE id = ?
            `,
            [id],
            (selectError, updatedRow) => {
              if (selectError) {
                console.error(selectError);
                return res.status(500).json({ message: "서버 오류가 발생했습니다." });
              }

              res.json(buildPostResponse(updatedRow));
            }
          );
        }
      );
    }
  );
};

const deletePost = (req, res, next) => {
  const id = Number(req.params.id);
  const { password } = req.body;

  if (!isValidId(id)) {
    return res.status(400).json({ message: "잘못된 게시글 ID입니다." });
  }

  if (!isNonEmptyString(password)) {
    return res.status(400).json({ message: "비밀번호는 필수입니다." });
  }

  db.get(
    `SELECT password FROM posts WHERE id = ?`,
    [id],
    (error, row) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
      }

      if (!row) {
        return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
      }

      if (row.password !== password.trim()) {
        return res.status(403).json({ message: "비밀번호가 일치하지 않습니다." });
      }

      db.run(`DELETE FROM posts WHERE id = ?`, [id], function (deleteError) {
        if (deleteError) {
          console.error(deleteError);
          return res.status(500).json({ message: "서버 오류가 발생했습니다." });
        }

        res.json({ message: "게시글 삭제 완료" });
      });
    }
  );
};

const likePost = (req, res, next) => {
  const id = Number(req.params.id);

  if (!isValidId(id)) {
    return res.status(400).json({ message: "잘못된 게시글 ID입니다." });
  }

  db.run(
    `UPDATE posts SET like_count = like_count + 1 WHERE id = ?`,
    [id],
    function (error) {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
      }

      db.get(`SELECT like_count FROM posts WHERE id = ?`, [id], (selectError, row) => {
        if (selectError) {
          console.error(selectError);
          return res.status(500).json({ message: "서버 오류가 발생했습니다." });
        }

        res.json({ id, like_count: row.like_count });
      });
    }
  );
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
};