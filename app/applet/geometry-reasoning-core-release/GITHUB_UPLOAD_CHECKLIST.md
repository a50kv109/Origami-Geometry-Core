# GITHUB_UPLOAD_CHECKLIST.md

## Repository Details
- Name: `geometry-reasoning-core`
- Directory: `/app/applet/geometry-reasoning-core-release/`
- Status: Ready for manual upload to GitHub.

## Files to Upload
- `package.json`
- `tsconfig.json`
- `README.md`
- `ARCHITECTURE.md`
- `STATUS.md`
- `TESTING.md`
- `KNOWN_LIMITATIONS.md`
- `LICENSE`
- `.gitignore`
- `src/` (core and experimental)
- `tests/`

## Upload Steps
1. Create a public repository named `geometry-reasoning-core` on GitHub.
2. Locally:
   ```bash
   cd geometry-reasoning-core-release
   git init
   git add .
   git commit -m "Initial commit: Geometry Reasoning Core"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
3. Check after upload:
   - Verify `node_modules` and `dist` are not present.
   - Verify all documentation files are correctly rendered in Markdown.
   - Run `npm test` once in the new environment to ensure environmental parity.

*Note: No secrets or tokens are included in this package.*
