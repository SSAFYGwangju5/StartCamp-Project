const express = require("express");
const db = require("../db");

const router = express.Router();

// 1. 게시글 목록 조회
router.get("/", (req, res) => {
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
    ORDER BY id DESC
    `,
    [],
    (error, rows) => {
      if (error) {
        console.error(error.message);
        return res.status(500).json({
          message: "게시글 목록 조회에 실패했습니다.",
        });
      }

      res.json(rows);
    }
  );
});

// 2. 게시글 상세 조회
router.get("/:id", (req, res) => {
  const { id } = req.params;

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
        console.error(error.message);
        return res.status(500).json({
          message: "게시글 상세 조회에 실패했습니다.",
        });
      }

      if (!row) {
        return res.status(404).json({
          message: "게시글이 없습니다.",
        });
      }

      res.json(row);
    }
  );
});

// 3. 게시글 작성
router.post("/", (req, res) => {
  const { title, content, password, category } = req.body;

  if (!title || !content || !password) {
    return res.status(400).json({
      message: "제목, 내용, 비밀번호는 필수입니다.",
    });
  }

  db.run(
    `
    INSERT INTO posts (title, content, password, category)
    VALUES (?, ?, ?, ?)
    `,
    [title, content, password, category || null],
    function (error) {
      if (error) {
        console.error(error.message);
        return res.status(500).json({
          message: "게시글 작성에 실패했습니다.",
        });
      }

      res.status(201).json({
        id: this.lastID,
        title,
        content,
        category: category || null,
      });
    }
  );
});

// 4. 게시글 수정
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { title, content, password, category } = req.body;

  if (!title || !content || !password) {
    return res.status(400).json({
      message: "제목, 내용, 비밀번호는 필수입니다.",
    });
  }

  db.get(
    "SELECT password FROM posts WHERE id = ?",
    [id],
    (error, row) => {
      if (error) {
        console.error(error.message);
        return res.status(500).json({
          message: "게시글 확인에 실패했습니다.",
        });
      }

      if (!row) {
        return res.status(404).json({
          message: "게시글이 없습니다.",
        });
      }

      if (row.password !== password) {
        return res.status(403).json({
          message: "비밀번호가 일치하지 않습니다.",
        });
      }

      db.run(
        `
        UPDATE posts
        SET
          title = ?,
          content = ?,
          category = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [title, content, category || null, id],
        function (updateError) {
          if (updateError) {
            console.error(updateError.message);
            return res.status(500).json({
              message: "게시글 수정에 실패했습니다.",
            });
          }

          res.json({
            message: "게시글 수정 완료",
          });
        }
      );
    }
  );
});

// 5. 게시글 삭제
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      message: "비밀번호는 필수입니다.",
    });
  }

  db.get(
    "SELECT password FROM posts WHERE id = ?",
    [id],
    (error, row) => {
      if (error) {
        console.error(error.message);
        return res.status(500).json({
          message: "게시글 확인에 실패했습니다.",
        });
      }

      if (!row) {
        return res.status(404).json({
          message: "게시글이 없습니다.",
        });
      }

      if (row.password !== password) {
        return res.status(403).json({
          message: "비밀번호가 일치하지 않습니다.",
        });
      }

      db.run(
        "DELETE FROM posts WHERE id = ?",
        [id],
        function (deleteError) {
          if (deleteError) {
            console.error(deleteError.message);
            return res.status(500).json({
              message: "게시글 삭제에 실패했습니다.",
            });
          }

          res.json({
            message: "게시글 삭제 완료",
          });
        }
      );
    }
  );
});

module.exports = router;