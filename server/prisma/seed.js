import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 12);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      profile: {
        create: {
          bio: 'System Administrator',
          location: 'Virtual'
        }
      }
    }
  });

  console.log('✅ Admin user created:', admin.email);
  console.log('🔑 Password: admin123');

  // Create a regular user for testing
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Regular User',
      role: 'user',
      profile: {
        create: {
          bio: 'Just a regular user',
          location: 'Somewhere'
        }
      }
    }
  });

  console.log('✅ Regular user created:', user.email);
  console.log('🔑 Password: user123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
