import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
	base: '/ouden.dev/',
	plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
	build: {
		rollupOptions: {
			input: {
				main: resolve(import.meta.dirname, 'index.html'),
				notes: resolve(import.meta.dirname, 'notes/index.html'),
				idempotency: resolve(import.meta.dirname, 'notes/idempotency/index.html'),
				llmPhysics: resolve(import.meta.dirname, 'notes/llm-physics/index.html'),
				credits: resolve(import.meta.dirname, 'notes/credits/index.html'),
			},
		},
	},
})
