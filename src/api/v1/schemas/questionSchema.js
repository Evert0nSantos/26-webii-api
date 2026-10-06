import { z } from "zod";
import {
  numericInputSchema,
  positiveIdSchema,
} from "../../../schemas/idSchema.js";

const enunciadoSchema = z
  .string()
  .trim()
  .min(3, "Enunciado deve ter no mínimo 3 caracteres")
  .max(500, "Enunciado deve ter no máximo 500 caracteres");

const dificuldadeSchema = numericInputSchema.pipe(
  z.coerce
    .number()
    .int("Dificuldade deve ser um número inteiro")
    .min(1, "Dificuldade deve ser entre 1 e 3")
    .max(3, "Dificuldade deve ser entre 1 e 3"),
);

const respostaCorretaSchema = z.union([
  z
    .string()
    .trim()
    .min(1, "Resposta correta não pode ser vazia")
    .max(500, "Resposta correta deve ter no máximo 500 caracteres"),
  z.null(),
]);

const ativaSchema = z.boolean();

export const createQuestionSchema = z
  .object({
    enunciado: enunciadoSchema,
    dificuldade: dificuldadeSchema,
    respostaCorreta: respostaCorretaSchema.optional(),
    subjectId: positiveIdSchema,
    authorId: positiveIdSchema,
    ativa: ativaSchema.optional(),
  })
  .strict();

export const updateQuestionSchema = z
  .object({
    enunciado: enunciadoSchema.optional(),
    dificuldade: dificuldadeSchema.optional(),
    respostaCorreta: respostaCorretaSchema.optional(),
    subjectId: positiveIdSchema.optional(),
    authorId: positiveIdSchema.optional(),
    ativa: ativaSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envie pelo menos um campo para atualização",
  });

export const questionIdParamSchema = z.object({
  id: positiveIdSchema,
});
