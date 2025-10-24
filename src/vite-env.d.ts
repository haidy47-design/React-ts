/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GROQ_API_KEY: string;
  // أضف أي متغيرات أخرى هنا لاحقاً
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
