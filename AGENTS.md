# Agent Instructions

- Response language: Japanese.
- Stack: Bun + Vanilla TypeScript. Keep it framework-free.
- Build: `bun run build` generates static assets in `dist/`.
- Preview: `bun run preview`.
- Typecheck: `bun run typecheck` (CI: `.github/workflows/typecheck.yml`).
- Inputs: Hex digits only (0-9, A-F), one digit per stat; 3-digit paste splits; sliders 0-15.
- Output: Total (0-45) and IV percent based on total / 45 (integer + 1 decimal).
- Files: keep edits minimal and ASCII-only unless Japanese is required.
