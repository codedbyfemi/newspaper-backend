import app from './app';
import { env } from './config/env';
import prisma from './config/database';

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✓ Database connected successfully');

    // Start server
    app.listen(env.PORT, () => {
      console.log(`✓ Server running on port ${env.PORT}`);
      console.log(`✓ Environment: ${env.NODE_ENV}`);
      console.log(`✓ Health check: http://localhost:${env.PORT}/health`);
    });
  } catch (error) {
    console.error('x Failed to start server:', error);
    process.exit(1);
  }
};

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.log('\nxShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
}); 

startServer();
