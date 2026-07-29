import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "school_a_test@cybermind.test" }
  });
  
  if (!user) {
    console.log("User not found");
    return;
  }
  
  console.log("User found:");
  console.log(`  email: ${user.email}`);
  console.log(`  password hash: ${user.password?.substring(0, 20)}...`);
  console.log(`  role: ${user.role}`);
  
  // Test password comparison
  const testPassword = "TestPass123!";
  const isValid = await bcrypt.compare(testPassword, user.password);
  console.log(`\nPassword "${testPassword}" matches: ${isValid}`);
  
  await prisma.$disconnect();
}

main().catch(console.error);
