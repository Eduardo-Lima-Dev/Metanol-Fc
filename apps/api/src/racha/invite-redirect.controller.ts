import { Controller, Get, Param, Res } from "@nestjs/common";
import type { Response } from "express";

const APP_SCHEME = "metanolfc";
const INVITE_CODE_PATTERN = /^[a-zA-Z0-9_-]+$/;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Página que serve de ponte entre o link de convite (https://.../join/CODIGO,
// que precisa ser clicável em qualquer lugar — WhatsApp, e-mail etc.) e o app
// em si, que só entende o scheme customizado metanolfc://join/CODIGO. Sem
// essa ponte, colar o link no navegador (sem o app instalado ou clicando fora
// dele) dava erro, porque metanolfc:// não é algo que o navegador sabe abrir.
@Controller("join")
export class InviteRedirectController {
  @Get(":inviteCode")
  redirect(@Param("inviteCode") inviteCode: string, @Res() res: Response) {
    const safeCode = INVITE_CODE_PATTERN.test(inviteCode) ? inviteCode : "";
    const deepLink = `${APP_SCHEME}://join/${encodeURIComponent(safeCode)}`;
    const displayCode = escapeHtml(inviteCode);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Convite Metanol FC</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; background: #0C0C0C; color: #F5F0E6; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; box-sizing: border-box; }
  .card { max-width: 420px; text-align: center; }
  h1 { font-size: 1.4rem; margin-bottom: 8px; }
  p { color: rgba(245,240,230,0.7); line-height: 1.5; }
  code { display: block; margin: 16px 0; padding: 12px; background: rgba(245,240,230,0.08); border-radius: 12px; font-size: 1.1rem; letter-spacing: 1px; }
  a.button { display: inline-block; margin-top: 8px; padding: 12px 24px; background: #D8A73C; color: #0C0C0C; border-radius: 999px; text-decoration: none; font-weight: 600; }
</style>
</head>
<body>
  <div class="card">
    <h1>Você foi convidado pra um racha!</h1>
    <p id="status">Abrindo o app Metanol FC...</p>
    <p>Se o app não abrir automaticamente, toque no botão abaixo ou entre no app manualmente com o código:</p>
    <code>${displayCode}</code>
    <a class="button" href="${deepLink}">Abrir no app</a>
  </div>
  <script>
    // Tenta abrir o app; se depois de um tempo a página ainda estiver
    // visível (o navegador não conseguiu redirecionar), assume que o app
    // não está instalado e ajusta a mensagem em vez de deixar "Abrindo..." parado.
    window.location.href = ${JSON.stringify(deepLink)};
    setTimeout(function () {
      var status = document.getElementById("status");
      if (status) {
        status.textContent = "Não conseguimos abrir o app automaticamente.";
      }
    }, 1500);
  </script>
</body>
</html>`);
  }
}
