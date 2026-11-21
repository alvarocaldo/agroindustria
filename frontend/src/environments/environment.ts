export const environment = {
  production: false,
  // Backend FastAPI: `uvicorn app.main:app --reload` (puerto 8000) + prefijo montado en app/main.py
  apiUrl: 'http://localhost:8000/api/v1',
} as const;
