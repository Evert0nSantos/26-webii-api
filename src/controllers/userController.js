// src/controllers/userController.js
import prisma from "../config/database.js";

const publicUserSelect = {
  id: true,
  nome: true,
  email: true,
  papel: true,
  foto: true,
  createdAt: true,
};

export const create = async (req, res) => {
  try {
    const { nome, email, papel, foto } = req.body;

    if (!nome || !email) {
      return res.status(400).json({
        success: false,
        message: "Nome e email são obrigatórios",
      });
    }

    const emailExistente = await prisma.user.findUnique({
      where: { email },
    });

    if (emailExistente) {
      return res.status(409).json({
        success: false,
        message: "Email já cadastrado no sistema",
      });
    }

    const novoUsuario = await prisma.user.create({
      data: {
        nome,
        email,
        papel: papel || "PROFESSOR",
        foto: foto || null,
      },
      select: publicUserSelect,
    });

    res.status(201).json({
      success: true,
      message: "Usuário criado com sucesso",
      data: novoUsuario,
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Email já cadastrado no sistema",
      });
    }

    res.status(500).json({
      success: false,
      message: "Erro ao criar usuário",
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      select: publicUserSelect,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: usuarios,
      total: usuarios.length,
    });
  } catch (error) {
    console.error("Erro ao listar usuários:", error);

    res.status(500).json({
      success: false,
      message: "Erro ao listar usuários",
    });
  }
};

export const getById = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. Deve ser um número",
      });
    }

    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: `Usuário com ID ${userId} não encontrado`,
      });
    }

    res.status(200).json({
      success: true,
      data: usuario,
    });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);

    res.status(500).json({
      success: false,
      message: "Erro ao buscar usuário",
    });
  }
};

export const update = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. Deve ser um número",
      });
    }

    const { nome, email, papel, foto } = req.body;

    if (
      nome === undefined &&
      email === undefined &&
      papel === undefined &&
      foto === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Informe pelo menos um campo para atualizar",
      });
    }

    const usuarioExistente = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        success: false,
        message: `Usuário com ID ${userId} não encontrado`,
      });
    }

    if (email !== undefined) {
      const emailExistente = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExistente && emailExistente.id !== userId) {
        return res.status(409).json({
          success: false,
          message: "Email já cadastrado no sistema",
        });
      }
    }

    const data = {};

    if (nome !== undefined) {
      if (typeof nome !== "string" || nome.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Nome inválido",
        });
      }

      data.nome = nome.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || email.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Email inválido",
        });
      }

      data.email = email.trim();
    }

    if (papel !== undefined) {
      if (papel !== "PROFESSOR" && papel !== "ADMIN") {
        return res.status(400).json({
          success: false,
          message: "Papel inválido",
        });
      }

      data.papel = papel;
    }

    if (foto !== undefined) {
      data.foto = foto;
    }

    const usuarioAtualizado = await prisma.user.update({
      where: { id: userId },
      data,
      select: publicUserSelect,
    });

    res.status(200).json({
      success: true,
      message: "Usuário atualizado com sucesso",
      data: usuarioAtualizado,
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Email já cadastrado no sistema",
      });
    }

    res.status(500).json({
      success: false,
      message: "Erro ao atualizar usuário",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. Deve ser um número",
      });
    }

    const usuarioExistente = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        _count: {
          select: {
            subjects: true,
            questions: true,
          },
        },
      },
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        success: false,
        message: `Usuário com ID ${userId} não encontrado`,
      });
    }

    if (
      usuarioExistente._count.subjects > 0 ||
      usuarioExistente._count.questions > 0
    ) {
      return res.status(409).json({
        success: false,
        message: "Usuário possui matérias ou questões vinculadas",
      });
    }

    const usuarioRemovido = await prisma.user.delete({
      where: { id: userId },
      select: publicUserSelect,
    });

    res.status(200).json({
      success: true,
      message: "Usuário excluído com sucesso",
      data: usuarioRemovido,
    });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);

    if (error.code === "P2003" || error.code === "P2014") {
      return res.status(409).json({
        success: false,
        message: "Usuário possui matérias ou questões vinculadas",
      });
    }

    res.status(500).json({
      success: false,
      message: "Erro ao excluir usuário",
    });
  }
};