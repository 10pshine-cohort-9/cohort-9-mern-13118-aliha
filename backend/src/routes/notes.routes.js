const express = require("express");
const notesController = require("../controllers/notes.controller");

const router = express.Router();
router.get("/", notesController.list);
router.post("/", notesController.create);
router.get("/:id", notesController.getOne);
router.put("/:id", notesController.update);
router.delete("/:id", notesController.remove);

module.exports = router;
