import prisma from "../src/config/database"

async function main() {
  console.log('🌱 Seeding database...');

  // Add allowlisted admin emails
  const allowlistedEmails = [
    { email: 'admin@school.edu', name: 'Admin User' },
    { email: 'editor@school.edu', name: 'Editor User' },
  ];

  for (const admin of allowlistedEmails) {
    await prisma.admin.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        name: admin.name,
        passwordHash: null, // Will be set on first login
      },
    });
    console.log(`✅ Added admin: ${admin.email}`);
  }

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });