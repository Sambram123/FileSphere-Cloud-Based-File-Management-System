## Contributing to FileSphere

### Branching model (simple and safe)
- **`main`**: always deployable (protected)
- **`feature/<short-name>`**: new features
- **`fix/<short-name>`**: bug fixes
- **`chore/<short-name>`**: maintenance (deps, cleanup)

### Local setup
```bash
npm install
npm start
```

### Before you open a PR
```bash
npm run build
npm test -- --watchAll=false
```

### Commit message guide
Use a short, descriptive message:
- `feat: add file preview for PDFs`
- `fix: prevent empty uploads`
- `chore: update docs`

### Pull request rules
- Keep PRs focused and small when possible.
- Include screenshots for UI changes.
- Don’t commit secrets:
  - Never commit `.env*`
  - Never paste private keys/tokens into code or docs

### Recommended GitHub settings (once)
In GitHub repo settings:
- Protect `main`
- Require PR reviews (1)
- Require status checks (CI) to pass

