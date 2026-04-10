import { prisma } from "../lib/prisma.ts";
import bcrypt from "bcryptjs";

async function main() {
  const email = "admin@empresa.com";
  const name = "Administrador";
  const novaSenha = "Sequoia@2026!";

  const senhaHash = await bcrypt.hash(novaSenha, 10);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    await prisma.user.update({
      where: { email },
      data: {
        password: senhaHash,
      },
    });

    console.log("✅ Senha atualizada com sucesso!");
  } else {
    await prisma.user.create({
      data: {
        name,
        email,
        password: senhaHash,
      },
    });

    console.log("✅ Usuário criado com sucesso!");
  }
}

main()
  .catch((error) => {
    console.error("❌ Erro ao executar script:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });