import prisma from "../config/database.js";
import { NotFoundError } from "../errors/AppError.js";

const publicUserSelect = {
  id: true,
  nome: true,
  email: true,
  papel: true,
  foto: true,
};

const publicSubjectSelect = {
  id: true,
  nome: true,
  ativa: true,
};

const publicQuestionSelect = {
  id: true,
  enunciado: true,
  dificuldade: true,
  respostaCorreta: true,
  ativa: true,
  createdAt: true,
  updatedAt: true,
  subject: { select: publicSubjectSelect },
  author: { select: publicUserSelect },
};

async function ensureRelatedRecordsExist({ subjectId, authorId }) {
  if (subjectId !== undefined) {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true },
    });

    if (!subject) {
      throw new NotFoundError("Disciplina não encontrada");
    }
  }

  if (authorId !== undefined) {
    const author = await prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true },
    });

    if (!author) {
      throw new NotFoundError("Autor não encontrado");
    }
  }
}

export const getAllQuestions = async () => {
  return prisma.question.findMany({
    select: publicQuestionSelect,
    orderBy: { createdAt: "desc" },
  });
};

export const getQuestionById = async (questionId) => {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: publicQuestionSelect,
  });

  if (!question) {
    throw new NotFoundError("Questão não encontrada");
  }

  return question;
};

export const createQuestion = async (questionData) => {
  await ensureRelatedRecordsExist(questionData);

  return prisma.question.create({
    data: {
      enunciado: questionData.enunciado.trim(),
      dificuldade: questionData.dificuldade,
      respostaCorreta: questionData.respostaCorreta?.trim() || null,
      subjectId: questionData.subjectId,
      authorId: questionData.authorId,
      ativa: questionData.ativa ?? true,
    },
    select: publicQuestionSelect,
  });
};

export const updateQuestion = async (questionId, questionData) => {
  const questionExists = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true },
  });

  if (!questionExists) {
    throw new NotFoundError("Questão não encontrada");
  }

  await ensureRelatedRecordsExist(questionData);

  const data = {};

  if (Object.hasOwn(questionData, "enunciado")) {
    data.enunciado = questionData.enunciado.trim();
  }

  if (Object.hasOwn(questionData, "dificuldade")) {
    data.dificuldade = questionData.dificuldade;
  }

  if (Object.hasOwn(questionData, "respostaCorreta")) {
    data.respostaCorreta = questionData.respostaCorreta?.trim() || null;
  }

  if (Object.hasOwn(questionData, "subjectId")) {
    data.subjectId = questionData.subjectId;
  }

  if (Object.hasOwn(questionData, "authorId")) {
    data.authorId = questionData.authorId;
  }

  if (Object.hasOwn(questionData, "ativa")) {
    data.ativa = questionData.ativa;
  }

  try {
    return await prisma.question.update({
      where: { id: questionId },
      data,
      select: publicQuestionSelect,
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new NotFoundError("Questão não encontrada");
    }

    throw error;
  }
};

export const deleteQuestion = async (questionId) => {
  const questionExists = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true },
  });

  if (!questionExists) {
    throw new NotFoundError("Questão não encontrada");
  }

  try {
    return await prisma.question.delete({
      where: { id: questionId },
      select: publicQuestionSelect,
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new NotFoundError("Questão não encontrada");
    }

    throw error;
  }
};
