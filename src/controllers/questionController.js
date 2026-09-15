import * as questionService from "../services/questionService.js";

function toPositiveInt(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

export const create = async (req, res) => {
  try {
    const {
      enunciado,
      dificuldade,
      respostaCorreta,
      ativa,
      subjectId,
      authorId,
    } = req.body;

    const subjectIdNumber = toPositiveInt(subjectId);
    const authorIdNumber = toPositiveInt(authorId);

    if (
      typeof enunciado !== "string" ||
      !enunciado.trim() ||
      !subjectIdNumber ||
      !authorIdNumber ||
      !Number.isInteger(dificuldade) ||
      dificuldade < 1 ||
      dificuldade > 3 ||
      (respostaCorreta !== undefined &&
        respostaCorreta !== null &&
        typeof respostaCorreta !== "string") ||
      (ativa !== undefined && typeof ativa !== "boolean")
    ) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
      });
    }

    const result = await questionService.createQuestion({
      enunciado,
      dificuldade,
      respostaCorreta,
      ativa,
      subjectId: subjectIdNumber,
      authorId: authorIdNumber,
    });

    if (!result.ok && result.reason === "SUBJECT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Matéria com ID ${subjectIdNumber} não encontrada`,
      });
    }

    if (!result.ok && result.reason === "AUTHOR_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Autor com ID ${authorIdNumber} não encontrado`,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Questão criada com sucesso",
      data: result.data,
    });
  } catch (error) {
    console.error("Erro ao criar questão:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao criar questão",
    });
  }
};

export const getAll = async (_req, res) => {
  try {
    const questoes = await questionService.getAllQuestions();

    return res.status(200).json({
      success: true,
      data: questoes,
      total: questoes.length,
    });
  } catch (error) {
    console.error("Erro ao listar questões:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao listar questões",
    });
  }
};

export const getById = async (req, res) => {
  try {
    const questionId = toPositiveInt(req.params.id);

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. Deve ser um número inteiro positivo",
      });
    }

    const questao = await questionService.getQuestionById(questionId);

    if (!questao) {
      return res.status(404).json({
        success: false,
        message: `Questão com ID ${questionId} não encontrada`,
      });
    }

    return res.status(200).json({
      success: true,
      data: questao,
    });
  } catch (error) {
    console.error("Erro ao buscar questão:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao buscar questão",
    });
  }
};

export const update = async (req, res) => {
  try {
    const questionId = toPositiveInt(req.params.id);

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. Deve ser um número inteiro positivo",
      });
    }

    const {
      enunciado,
      dificuldade,
      respostaCorreta,
      ativa,
      subjectId,
      authorId,
    } = req.body;

    const allowedFields = [
      "enunciado",
      "dificuldade",
      "respostaCorreta",
      "ativa",
      "subjectId",
      "authorId",
    ];

    const hasAllowedField = allowedFields.some((field) =>
      Object.hasOwn(req.body, field),
    );

    if (!hasAllowedField) {
      return res.status(400).json({
        success: false,
        message: "Informe ao menos um campo válido para atualização",
      });
    }

    if (
      Object.hasOwn(req.body, "enunciado") &&
      (typeof enunciado !== "string" || !enunciado.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Enunciado inválido",
      });
    }

    if (
      Object.hasOwn(req.body, "dificuldade") &&
      (!Number.isInteger(dificuldade) || dificuldade < 1 || dificuldade > 3)
    ) {
      return res.status(400).json({
        success: false,
        message: "Dificuldade deve ser um número inteiro entre 1 e 3",
      });
    }

    if (
      Object.hasOwn(req.body, "respostaCorreta") &&
      respostaCorreta !== null &&
      typeof respostaCorreta !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "respostaCorreta deve ser texto ou nulo",
      });
    }

    if (Object.hasOwn(req.body, "ativa") && typeof ativa !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Ativa deve ser booleana",
      });
    }

    let subjectIdNumber;
    let authorIdNumber;

    if (Object.hasOwn(req.body, "subjectId")) {
      subjectIdNumber = toPositiveInt(subjectId);

      if (!subjectIdNumber) {
        return res.status(400).json({
          success: false,
          message: "subjectId deve ser um número inteiro positivo",
        });
      }
    }

    if (Object.hasOwn(req.body, "authorId")) {
      authorIdNumber = toPositiveInt(authorId);

      if (!authorIdNumber) {
        return res.status(400).json({
          success: false,
          message: "authorId deve ser um número inteiro positivo",
        });
      }
    }

    const result = await questionService.updateQuestion(questionId, {
      ...(Object.hasOwn(req.body, "enunciado") && { enunciado }),
      ...(Object.hasOwn(req.body, "dificuldade") && { dificuldade }),
      ...(Object.hasOwn(req.body, "respostaCorreta") && {
        respostaCorreta,
      }),
      ...(Object.hasOwn(req.body, "ativa") && { ativa }),
      ...(Object.hasOwn(req.body, "subjectId") && {
        subjectId: subjectIdNumber,
      }),
      ...(Object.hasOwn(req.body, "authorId") && {
        authorId: authorIdNumber,
      }),
    });

    if (!result.ok && result.reason === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Questão com ID ${questionId} não encontrada`,
      });
    }

    if (!result.ok && result.reason === "SUBJECT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Matéria com ID ${subjectIdNumber} não encontrada`,
      });
    }

    if (!result.ok && result.reason === "AUTHOR_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Autor com ID ${authorIdNumber} não encontrado`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Questão atualizada com sucesso",
      data: result.data,
    });
  } catch (error) {
    console.error("Erro ao atualizar questão:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao atualizar questão",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const questionId = toPositiveInt(req.params.id);

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. Deve ser um número inteiro positivo",
      });
    }

    const result = await questionService.deleteQuestion(questionId);

    if (!result.ok && result.reason === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Questão com ID ${questionId} não encontrada`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Questão excluída com sucesso",
      data: result.data,
    });
  } catch (error) {
    console.error("Erro ao excluir questão:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao excluir questão",
    });
  }
};
