import { Router } from "express";
import * as subjectController from "../controllers/subjectController.js";

const router = Router();

router.post("/", subjectController.create);
router.get("/", subjectController.getAll);
router.get("/:id", subjectController.getById);
router.patch("/:id", subjectController.update);
router.delete("/:id", subjectController.remove);

export default router;
