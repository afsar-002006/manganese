# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Deploying to Netlify

1. Push this repository to GitHub and create a new Netlify site from it.
2. Netlify reads `netlify.toml` automatically:
   - Build: `bun install --frozen-lockfile && bun run build`
   - Publish directory: `dist` (the server side is bundled into a Netlify function)
   - `NITRO_PRESET=netlify` plus the public backend URL/key needed at build time
3. Optional: in **Site settings -> Environment variables**, add
   `SUPABASE_SERVICE_ROLE_KEY` if any server function needs privileged access,
   and override the `VITE_SUPABASE_*` values to point at a different backend.
4. Add the Netlify site URL to the backend auth settings as an allowed redirect URL
   so sign-in works on the deployed domain.
