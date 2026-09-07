// src/controllers/subjectController.js
import prisma from "../config/database.js";

/**
 * Controller de Matérias
 * Responsável por gerenciar as operações de criação e leitura de matérias.
 */

// CREATE - Criar uma matéria
export const create = async (req, res) => {
  try {
    const { nome, professorId, ativa } = req.body;

    // Validação dos campos obrigatórios
    if (!nome || professorId === undefined) {
      return res.status(400).json({
        success: false,
        message: "Nome e professorId são obrigatórios",
      });
    }

    // Validação do ID do professor
    const professorIdNumerico = Number(professorId);

    if (
      !Number.isInteger(professorIdNumerico) ||
      professorIdNumerico <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "professorId inválido. Deve ser um número inteiro positivo",
      });
    }

    // Verifica se o professor existe
    const professor = await prisma.user.findUnique({
      where: { id: professorIdNumerico },
    });

    if (!professor) {
      return res.status(404).json({
        success: false,
        message: `Professor com ID ${professorIdNumerico} não encontrado`,
      });
    }

    // Cria a matéria
    const novaMateria = await prisma.subject.create({
      data: {
        nome,
        professorId: professorIdNumerico,
        ativa: ativa !== undefined ? ativa : true,
      },
      select: {
        id: true,
        nome: true,
        ativa: true,
        professorId: true,
        createdAt: true,
        updatedAt: true,
        professor: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Matéria criada com sucesso",
      data: novaMateria,
    });
  } catch (error) {
    console.error("Erro ao criar matéria:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao criar matéria",
    });
  }
};

// READ - Listar todas as matérias
export const getAll = async (req, res) => {
  try {
    const materias = await prisma.subject.findMany({
      select: {
        id: true,
        nome: true,
        ativa: true,
        professorId: true,
        createdAt: true,
        updatedAt: true,
        professor: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: materias,
      total: materias.length,
    });
  } catch (error) {
    console.error("Erro ao listar matérias:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao listar matérias",
    });
  }
};

// READ - Buscar matéria por ID
export const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const subjectId = Number(id);

    // Validação do ID
    if (!Number.isInteger(subjectId) || subjectId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. Deve ser um número",
      });
    }

    // Busca a matéria
    const materia = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: {
        id: true,
        nome: true,
        ativa: true,
        professorId: true,
        createdAt: true,
        updatedAt: true,
        professor: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    // Matéria não encontrada
    if (!materia) {
      return res.status(404).json({
        success: false,
        message: `Matéria com ID ${subjectId} não encontrada`,
      });
    }

    return res.status(200).json({
      success: true,
      data: materia,
    });
  } catch (error) {
    console.error("Erro ao buscar matéria:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao buscar matéria",
    });
  }
};