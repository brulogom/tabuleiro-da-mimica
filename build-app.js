// Gera a versão instalável (PWA) do jogo em ./docs a partir de ./mimica.html.
// Uso: node build-app.js
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const OUT = path.join(ROOT, "docs");
let src = fs.readFileSync(path.join(ROOT, "mimica.html"), "utf8");

// Fora do claude.ai não existe window.claude — o banco de palavras passa a
// ser guardado no próprio aparelho (localStorage) com a mesma interface.
const localDbShim = `<script>
(function(){
  if (window.claude && typeof window.claude.use === "function") return;
  var KEY = "mimica:categories/words";
  var listeners = [];
  function read(){ try { var raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch(e){ return null; } }
  function write(data){ try { localStorage.setItem(KEY, JSON.stringify(data)); } catch(e){} }
  function snap(){ var d = read(); return { exists: !!d, data: function(){ return d; } }; }
  var doc = {
    get: function(){ return Promise.resolve(snap()); },
    set: function(data){ write(data); return Promise.resolve(); },
    update: function(patch){ var d = read() || {}; Object.keys(patch).forEach(function(k){ d[k] = patch[k]; }); write(d); return Promise.resolve(); },
    onSnapshot: function(cb){ listeners.push(cb); return function(){}; }
  };
  window.claude = { use: function(name){ return Promise.resolve(name === "db" ? { doc: function(){ return doc; } } : null); } };
})();
</script>
`;

src = src.replace(
  "O jogo sempre lê esta lista atualizada — as mudanças valem para todos os dispositivos.",
  "As mudanças ficam salvas neste aparelho."
);
if (src.includes("valem para todos os dispositivos")) throw new Error("Texto de status não substituído");

// As fotos das dicas vêm embutidas (data URI) no mimica.html. No app elas viram
// arquivos em ./docs/hints/ — o index.html fica leve e cada foto só é baixada
// quando a dica é aberta. O nome leva o hash do conteúdo, então foto nova ou
// alterada muda o index.html e, com isso, a versão do cache.
const HINTS_DIR = path.join(OUT, "hints");
const EXT = { "/9j/": "jpg", "iVBOR": "png", "R0lGOD": "gif", "UklGR": "webp" };
const hintFiles = {};
const imgStart = src.indexOf("var HINT_IMAGES = {");
const imgEnd = src.indexOf("\n  };", imgStart);
if (imgStart < 0 || imgEnd < 0) throw new Error("HINT_IMAGES não encontrado");
const imgBlock = src.slice(imgStart, imgEnd).replace(/"data:image\/[a-z+]+;base64,([A-Za-z0-9+/=]+)"/g, function(_, b64){
  const buf = Buffer.from(b64, "base64");
  const prefix = Object.keys(EXT).find((p) => b64.startsWith(p));
  if (!prefix) throw new Error("Formato de imagem desconhecido: " + b64.slice(0, 12));
  const name = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 12) + "." + EXT[prefix];
  hintFiles[name] = buf;
  return JSON.stringify("hints/" + name);
});
if (imgBlock.includes("data:image")) throw new Error("Sobrou imagem embutida em HINT_IMAGES");
src = src.slice(0, imgStart) + imgBlock + src.slice(imgEnd);
const hintPaths = Object.keys(hintFiles).map((n) => "hints/" + n);


const head = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#FF5A36">
<meta name="description" content="Jogo de mímica em tabuleiro para jogar em equipes.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Mímica">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<style>body{margin:0;}</style>
${localDbShim}`;

// Respeita o entalhe/barra do sistema quando o app abre em tela cheia.
// Vai depois do <style> do jogo pra sobrescrever o padding dele.
const safeAreaTail = `<style>
  body{padding-top:max(18px, env(safe-area-inset-top)); padding-left:max(16px, env(safe-area-inset-left)); padding-right:max(16px, env(safe-area-inset-right)); padding-bottom:max(40px, env(safe-area-inset-bottom));}
</style>
`;

const swRegister = `
<script>
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function(){ navigator.serviceWorker.register("sw.js").catch(function(){}); });
}
</script>
</body>
</html>
`;

// Tudo antes do primeiro <div class="wrap"> (título, fontes, <style>) vai pro <head>.
const bodyStart = src.indexOf('<div class="wrap">');
if (bodyStart < 0) throw new Error("Início do corpo não encontrado");
const html = head + src.slice(0, bodyStart) + safeAreaTail + "</head>\n<body>\n" + src.slice(bodyStart) + swRegister;

const manifest = {
  name: "Tabuleiro da Mímica",
  short_name: "Mímica",
  description: "Jogo de mímica em tabuleiro para jogar em equipes.",
  lang: "pt-BR",
  start_url: "./",
  scope: "./",
  display: "standalone",
  orientation: "any",
  background_color: "#EEF0E6",
  theme_color: "#FF5A36",
  icons: [
    { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
  ]
};

const version = crypto.createHash("sha1").update(html).digest("hex").slice(0, 10);

const sw = `// Gerado por build-app.js — versão ${version}
const CACHE = "mimica-${version}";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-180.png"];
// Fotos das dicas: baixadas em segundo plano pra funcionarem offline, sem
// travar a instalação se alguma falhar (quem faltar vem da rede depois).
const HINT_PHOTOS = ${JSON.stringify(hintPaths)};

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
  caches.open(CACHE).then((c) => Promise.all(HINT_PHOTOS.map((u) => c.add(u).catch(() => {})))).catch(() => {});
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("mimica-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Página: tenta a rede (pra pegar versão nova) e cai pro cache se estiver offline.
// Demais arquivos (ícones, fontes do Google): cache primeiro.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("index.html", copy)); return res; })
        .catch(() => caches.match("index.html"))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});
`;

fs.mkdirSync(OUT, { recursive: true });
fs.rmSync(HINTS_DIR, { recursive: true, force: true });
fs.mkdirSync(HINTS_DIR, { recursive: true });
Object.keys(hintFiles).forEach((n) => fs.writeFileSync(path.join(HINTS_DIR, n), hintFiles[n]));
fs.writeFileSync(path.join(OUT, "index.html"), html);
fs.writeFileSync(path.join(OUT, "manifest.webmanifest"), JSON.stringify(manifest, null, 2));
fs.writeFileSync(path.join(OUT, "sw.js"), sw);
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
console.log("App gerado em ./docs (versão " + version + ")");
