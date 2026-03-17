import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

type Args = {
  email: string;
  password: string;
  role?: "SUPER_ADMIN" | "MANAGER";
};

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.email || !args.password) {
    console.error(
      "Usage: npx tsx scripts/create-admin.ts --email admin@villa-reel.fr --password yourPassword [--role SUPER_ADMIN|MANAGER]",
    );
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(args.password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: args.email.toLowerCase() },
    update: {
      hashedPassword,
      role: args.role ?? "SUPER_ADMIN",
    },
    create: {
      email: args.email.toLowerCase(),
      hashedPassword,
      role: args.role ?? "SUPER_ADMIN",
    },
  });
  console.log("Admin user created/updated:", {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  });
}

function parseArgs(argv: string[]): Args {
  const out: Partial<Args> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--email") {
      out.email = argv[i + 1];
      i++;
    } else if (arg === "--password") {
      out.password = argv[i + 1];
      i++;
    } else if (arg === "--role") {
      const value = argv[i + 1];
      if (value === "SUPER_ADMIN" || value === "MANAGER") {
        out.role = value;
      }
      i++;
    }
  }
  return out as Args;
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

