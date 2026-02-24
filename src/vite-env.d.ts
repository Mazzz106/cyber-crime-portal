/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL?: string;
	readonly VITE_N8N_WEBHOOK_URL?: string;
	readonly VITE_BACKEND_PROVIDER?: 'supabase' | 'n8n';
	readonly VITE_SUPABASE_URL?: string;
	readonly VITE_SUPABASE_ANON_KEY?: string;
	readonly VITE_SUPABASE_FUNCTIONS_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
