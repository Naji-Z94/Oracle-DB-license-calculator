import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'Oracle-DB-license-calculator'
  const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === 'true'

  return {
    base: isGitHubPagesBuild ? `/${repositoryName}/` : '/',
    plugins: [react()],
  }
})
