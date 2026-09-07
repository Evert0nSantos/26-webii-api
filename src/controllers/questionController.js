// src/controllers/questionController.js
import prisma from "../config/database.js";

/**
 * Controller de Questões
 * Responsável por gerenciar as operações de criação e leitura de questões.
 */

// CREATE - Criar uma questão
export const create = async (req, res) => {
  try {
    const {
      enunciado,
      dificuldade,
      respostaCorreta,
      subjectId,
      authorId,
      ativa,
    } = req.body;

    // Validação dos campos obrigatórios
    if (
      !enunciado ||
      dificuldade === undefined ||
      subjectId === undefined ||
      authorId === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Enunciado, dificuldade, subjectId e authorId são obrigatórios",
      });
    }

    // Converte os IDs e dificuldade para número
    const dificuldadeNumerica = Number(dificuldade);
    const subjectIdNumerico = Number(subjectId);
    const authorIdNumerico = Number(authorId);

    // Valida dificuldade
    if (
      !Number.isInteger(dificuldadeNumerica) ||
      ![1, 2, 3].includes(dificuldadeNumerica)
    ) {
      return res.status(400).json({
        success: false,
        message: "Dificuldade inválida. Deve ser 1, 2 ou 3",
      });
    }

    // Valida subjectId
    if (
      !Number.isInteger(subjectIdNumerico) ||
      subjectIdNumerico <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "subjectId inválido. Deve ser um número inteiro positivo",
      });
    }

    // Valida authorId
    if (
      !Number.isInteger(authorIdNumerico) ||
      authorIdNumerico <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "authorId inválido. Deve ser um número inteiro positivo",
      });
    }

    // Verifica se a matéria existe
    const materia = await prisma.subject.findUnique({
      where: { id: subjectIdNumerico },
    });

    if (!materia) {
      return res.status(404).json({
        success: false,
        message: `Matéria com ID ${subjectIdNumerico} não encontrada`,
      });
    }

    // Verifica se o autor existe
    const autor = await prisma.user.findUnique({
      where: { id: authorIdNumerico },
    });

    if (!autor) {
      return res.status(404).json({
        success: false,
        message: `Autor com ID ${authorIdNumerico} não encontrado`,
      });
    }

    // Cria a questão
    const novaQuestao = await prisma.question.create({
      data: {
        enunciado,
        dificuldade: dificuldadeNumerica,
        respostaCorreta: respostaCorreta || null,
        subjectId: subjectIdNumerico,
        authorId: authorIdNumerico,
        ativa: ativa !== undefined ? ativa : true,
      },
      select: {
        id: true,
        enunciado: true,
        dificuldade: true,
        respostaCorreta: true,
        subjectId: true,
        authorId: true,
        ativa: true,
        createdAt: true,
        updatedAt: true,
        subject: {
          select: {
            id: true,
            nome: true,
            ativa: true,
          },
        },
        author: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Questão criada com sucesso",
      data: novaQuestao,
    });
  } catch (error) {
    console.error("Erro ao criar questão:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao criar questão",
    });
  }
};

// READ - Listar todas as questões
export const getAll = async (req, res) => {
  try {
    const questoes = await prisma.question.findMany({
      select: {
        id: true,
        enunciado: true,
        dificuldade: true,
        respostaCorreta: true,
        subjectId: true,
        authorId: true,
        ativa: true,
        createdAt: true,
        updatedAt: true,
        subject: {
          select: {
            id: true,
            nome: true,
            ativa: true,
          },
        },
        author: {
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

// READ - Buscar questão por ID
export const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const questionId = Number(id);

    // Validação do ID
    if (!Number.isInteger(questionId) || questionId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. Deve ser um número",
      });
    }

    // Busca a questão
    const questao = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        enunciado: true,
        dificuldade: true,
        respostaCorreta: true,
        subjectId: true,
        authorId: true,
        ativa: true,
        createdAt: true,
        updatedAt: true,
        subject: {
          select: {
            id: true,
            nome: true,
            ativa: true,
          },
        },
        author: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    // Questão não encontrada
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