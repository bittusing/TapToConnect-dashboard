declare global {
    namespace NodeJS {
      interface ProcessEnv {
        MONGO_URI: string;
        SESSION_SECRET: string;
        REFRESH_SECRET: string;
        NODE_ENV: 'development' | 'production' | 'test';
      }
    }
  }
  
  export {};