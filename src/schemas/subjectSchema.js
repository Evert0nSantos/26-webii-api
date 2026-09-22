import { z } from "zod";
import { positiveIdSchema } from "./idSchema.js";

const nomeSchema = z
  .string()
  .trim()
  .min(3, "Nome deve ter no mínimo 3 caracteres")
  .max(100, "Nome deve ter no máximo 100 caracteres");

const professorIdSchema = positiveIdSchema;

const ativaSchema = z.boolean();

export const createSubjectSchema = z
  .object({
    nome: nomeSchema,
    professorId: professorIdSchema,
    ativa: ativaSchema.optional(),
  })
  .strict();

export const updateSubjectSchema = z
  .object({
    nome: nomeSchema.optional(),
    professorId: professorIdSchema.optional(),
    ativa: ativaSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envie pelo menos um campo para atualização",
  });

export const subjectIdParamSchema = z.object({
  id: positiveIdSchema,
});
