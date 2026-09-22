import prisma from "../config/database.js";
import { ConflictError, NotFoundError } from "../errors/AppError.js";

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
  createdAt: true,
  updatedAt: true,
  professor: { select: publicUserSelect },
};

export const getAllSubjects = async () => {
  return prisma.subject.findMany({
    select: publicSubjectSelect,
    orderBy: { createdAt: "desc" },
  });
};

export const getSubjectById = async (subjectId) => {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: publicSubjectSelect,
  });

  if (!subject) {
    throw new NotFoundError("Disciplina não encontrada");
  }

  return subject;
};

export const createSubject = async (subjectData) => {
  const professor = await prisma.user.findUnique({
    where: { id: subjectData.professorId },
    select: { id: true },
  });

  if (!professor) {
    throw new NotFoundError("Professor não encontrado");
  }

  return prisma.subject.create({
    data: {
      nome: subjectData.nome.trim(),
      professorId: subjectData.professorId,
      ativa: subjectData.ativa ?? true,
    },
    select: publicSubjectSelect,
  });
};

export const updateSubject = async (subjectId, subjectData) => {
  const subjectExists = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { id: true },
  });

  if (!subjectExists) {
    throw new NotFoundError("Disciplina não encontrada");
  }

  if (Object.hasOwn(subjectData, "professorId")) {
    const professor = await prisma.user.findUnique({
      where: { id: subjectData.professorId },
      select: { id: true },
    });

    if (!professor) {
      throw new NotFoundError("Professor não encontrado");
    }
  }

  const data = {};

  if (Object.hasOwn(subjectData, "nome")) {
    data.nome = subjectData.nome.trim();
  }

  if (Object.hasOwn(subjectData, "ativa")) {
    data.ativa = subjectData.ativa;
  }

  if (Object.hasOwn(subjectData, "professorId")) {
    data.professorId = subjectData.professorId;
  }

  try {
    return await prisma.subject.update({
      where: { id: subjectId },
      data,
      select: publicSubjectSelect,
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new NotFoundError("Disciplina não encontrada");
    }

    throw error;
  }
};

export const deleteSubject = async (subjectId) => {
  const subjectExists = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: {
      id: true,
      _count: { select: { questions: true } },
    },
  });

  if (!subjectExists) {
    throw new NotFoundError("Disciplina não encontrada");
  }

  if (subjectExists._count.questions > 0) {
    throw new ConflictError(
      "Não é possível excluir a disciplina porque existem questões vinculadas",
    );
  }

  try {
    return await prisma.subject.delete({
      where: { id: subjectId },
      select: publicSubjectSelect,
    });
  } catch (error) {
    if (error.code === "P2003" || error.code === "P2014") {
      throw new ConflictError(
        "Não é possível excluir a disciplina porque existem registros vinculados",
      );
    }

    if (error.code === "P2025") {
      throw new NotFoundError("Disciplina não encontrada");
    }

    throw error;
  }
};
