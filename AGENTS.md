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

- Keep chart extraction separate from deterministic scanner rules so image-model output cannot override strategy precedence or risk calculations.
- Route streaming first-party chart uploads through a same-origin validated endpoint; images are transient and the service-owned error circuit breaker is private to server operations.
- Keep AI SDK Responses and run-ID helpers in server-only modules so prompts and credentials never enter the browser bundle.
