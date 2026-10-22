<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- All UI copy lives in `src/lib/i18n.tsx` (EN/FR/IT/DE dictionaries typed from EN); never hardcode visible text in components — keeps 4 languages in sync.
- Fee rules live in `src/lib/pricing.ts` with tests in `src/test/pricing.test.ts` — single source for prices.
- Shared chrome (banner, nav, footer) is rendered in `__root.tsx`; page sections live in `src/components/sections.tsx`.
