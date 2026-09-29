// Gerado por build-app.js — versão 522c12531b
const CACHE = "festa-522c12531b";
const SHELL = ["./","index.html","mimica.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/icon-180.png","conteudo/impostor.js","conteudo/palavra-proibida.js","conteudo/quem-sou-eu.js","conteudo/roda-das-letras.js","conteudo/telefone.js","css/festa.css","js/calculos.js","js/core.js","js/hub.js","js/jogos/cidade-dorme.js","js/jogos/impostor.js","js/jogos/mimica.js","js/jogos/palavra-proibida.js","js/jogos/quem-sou-eu.js","js/jogos/roda-das-letras.js","js/jogos/sorteador.js","js/jogos/telefone.js"];
// Fotos das dicas: baixadas em segundo plano pra funcionarem offline, sem
// travar a instalação se alguma falhar (quem faltar vem da rede depois).
const HINT_PHOTOS = ["hints/a6c097a2ea06.jpg","hints/48ec7c834b04.jpg","hints/11234b6dc449.jpg","hints/68ff942a96a7.jpg","hints/63988b207697.jpg","hints/67215b458285.jpg","hints/684f0047ae89.jpg","hints/03beeb4991b7.jpg","hints/f350da44b73c.jpg","hints/0157ba71a90a.jpg","hints/6ec4959eb775.jpg","hints/a8134ef82183.jpg","hints/56db48edde79.jpg","hints/1fc43fe95b99.jpg","hints/8d78e88d9229.jpg","hints/37b645a60ddb.jpg","hints/6946ddda2c1e.jpg","hints/f9d33fdee52d.jpg","hints/6978412dd575.jpg","hints/a275ba667936.jpg","hints/b959acd2ee07.jpg","hints/eaed0058cc2f.jpg","hints/46fc68ed5f4f.jpg","hints/e2867783368b.jpg","hints/443bc0b36ca2.jpg","hints/4af823b7d236.jpg","hints/3dc1647db96a.jpg","hints/954313486342.jpg","hints/6c7ee984a495.jpg","hints/e0a9dc9d814b.jpg","hints/5f8c881364f8.jpg","hints/351f1cfff530.jpg","hints/32a60a6ac923.jpg","hints/555a4fb4ab86.jpg","hints/c07972c64ab6.jpg","hints/4a15dd7404e2.jpg","hints/da5d44b7d533.jpg","hints/80ed4637fd40.jpg","hints/a6cf65566e7a.jpg","hints/c63d1b44440b.jpg","hints/98c03c37af43.jpg","hints/332aa12b0c7e.jpg","hints/6b46f0082b8b.jpg","hints/563024c831b3.jpg","hints/defa7d785d25.jpg","hints/7dc66f6ec620.jpg","hints/f21155ee6c73.jpg","hints/e11057aa0a36.jpg","hints/a2970a1dcab6.jpg","hints/c5c51dd383aa.jpg","hints/aa8d052d4840.jpg","hints/8ec2be860d8a.jpg","hints/01410f064276.jpg","hints/a92229f153b9.jpg","hints/e9dca1dde00c.jpg","hints/16de58f69b60.jpg","hints/5ced22728688.jpg","hints/00fbf1c0e001.jpg","hints/e973ff240c90.jpg","hints/c49f15856eba.jpg","hints/d058e91ae87a.png","hints/d5a653baf3f5.jpg","hints/ccccd0e4493f.jpg","hints/aa4cb47008f1.jpg","hints/ffced9857caa.jpg","hints/d81d3e69f592.jpg","hints/cfb9f3b78a2c.jpg","hints/1c97e04a91c7.jpg","hints/b4fa682e2596.jpg","hints/a78f5ff08975.jpg","hints/77482d899371.jpg","hints/7c2e443d21a4.jpg","hints/d083b7143051.jpg","hints/1bfc3c8052ca.jpg","hints/1af08bbbd490.jpg","hints/5485b5f0b7f0.jpg","hints/67ff0ba53089.jpg","hints/f4100eac4f23.jpg","hints/e31f6bce28df.jpg","hints/cd13e85904b3.jpg","hints/fb0b85252c80.jpg","hints/1680e2be8bb6.jpg","hints/5ef7ff3b1b03.jpg","hints/b8fa9c4759b2.jpg","hints/d22035c8e757.jpg","hints/a2227b248a72.jpg","hints/4b40679e78e4.png","hints/4a4b255913c3.jpg","hints/6323217849b9.jpg","hints/171adb47ece9.jpg","hints/01ecee952c93.jpg","hints/4e759cca4992.jpg","hints/702d6d1f3b34.jpg","hints/a0bb3aa18ca4.jpg","hints/86835d59fbe7.jpg","hints/96a5297ec418.jpg","hints/338226733aeb.jpg","hints/ef77162f909f.jpg","hints/21bda05e0db5.jpg","hints/15c5f9d1d24e.jpg","hints/0295e2de95c6.jpg","hints/6d8fa9b6ae1d.jpg","hints/1659f14ba516.jpg","hints/366d6c035a3c.jpg","hints/2c18dee084f7.jpg","hints/f9d3f007f9c7.jpg","hints/210fd02108e6.jpg","hints/9da85c2d38c2.jpg","hints/4b5458d4554f.jpg","hints/e6f80c048935.jpg","hints/73f437250aa1.jpg","hints/ccab0f81f8fb.jpg","hints/02873b4df09f.jpg","hints/4570c92598fb.jpg","hints/c67fe1bbd597.jpg","hints/8397ed2acf20.jpg","hints/a66e646fa5ff.jpg","hints/0a502fa4e696.jpg","hints/ef4849fc1f51.jpg","hints/902d1bbf8b55.jpg","hints/cc6a8435c10e.jpg","hints/6f9002ffc0da.jpg","hints/e716c8651ea2.jpg","hints/d7105ee333b0.jpg","hints/b03caf6c0718.jpg","hints/c732c3d317ba.jpg","hints/63573ee5f639.jpg","hints/4fff78831cb5.jpg","hints/1daf3248428f.jpg","hints/d9dcadc61613.jpg","hints/3bf705cb057f.jpg","hints/96dd64c4942f.jpg","hints/c6b738f942cd.jpg","hints/934c41210951.jpg","hints/450df49137e1.jpg","hints/cc569a7562e1.jpg","hints/81dd0facffdf.jpg","hints/bf4def6336f0.jpg","hints/c2936d523e4f.jpg","hints/e81056c37d40.jpg","hints/c1409de0f497.jpg","hints/71993ee642b9.jpg","hints/6c176a2e2237.jpg","hints/3400f08e5984.jpg","hints/7b35f63f976b.jpg","hints/3539e21319a8.jpg","hints/8e5aff3d5df7.jpg","hints/6956548cf743.jpg","hints/f17e6ed1ef63.jpg","hints/4bc88b4ca475.jpg","hints/72f5637469bb.jpg","hints/676f99dc94b6.jpg","hints/dd86c836183a.png","hints/9c69f672aac7.jpg","hints/c9e879e0064f.jpg","hints/41c41f254be7.jpg","hints/6218ce7d492e.jpg","hints/c5d5da971526.jpg","hints/6f3653d698bd.jpg","hints/f0106e096213.jpg","hints/f754401ddd75.jpg","hints/c0a58ad87756.jpg","hints/7834a42eb127.jpg","hints/75c788e1424f.jpg","hints/d7d3f29b55ac.jpg","hints/bbfb373eae4a.jpg","hints/c298349802ee.jpg","hints/9018aafc4d8a.jpg","hints/297a57835a2d.jpg","hints/3c3a1ffa8a9d.jpg","hints/5cb828ce9832.jpg","hints/bb117d5d0087.jpg","hints/26a519dc781a.jpg","hints/c5897899909b.jpg","hints/1da0edd54bdd.jpg","hints/914f68201d4c.jpg","hints/4424a85ee37d.jpg","hints/857072d25d63.jpg","hints/9ff81b30a085.jpg","hints/0b20b42de4b0.jpg","hints/d4f6e249b147.jpg","hints/a2f3cc278a22.jpg","hints/9fbf3463c391.jpg","hints/c5f787829a04.jpg","hints/46966e643c02.jpg","hints/c783e073b7c5.jpg","hints/b3e1eb3d60f7.jpg","hints/77b756c9640d.gif","hints/58853de4738c.jpg","hints/e9e405fc26bd.jpg","hints/8d34cc5c3ca0.jpg","hints/db152711f6c2.jpg","hints/a0624fa1c196.jpg","hints/dc40f23ee154.jpg","hints/99e14ca401d8.jpg","hints/cc0e2453b1df.jpg","hints/165d33f04ea6.jpg","hints/aa2c9c28d670.jpg","hints/5dfa11862192.jpg","hints/77895c4cfe16.jpg","hints/9003f78bddef.jpg","hints/83dc1cbcac14.jpg","hints/ead452ed20e6.jpg","hints/90f668264312.jpg","hints/e6b3182fec5c.jpg","hints/76593db068a7.jpg","hints/6fa0fa9d9afb.jpg","hints/d91dcd7ba861.jpg","hints/ecf160869d5b.jpg","hints/be5d86324140.jpg","hints/db474143fe3c.jpg","hints/509bff02ab9a.jpg","hints/7d4c8707c6c2.jpg","hints/b419cf101fe6.jpg","hints/bf8b7e5254ad.jpg","hints/0a367880f34f.jpg","hints/eca1a5f5289d.jpg","hints/da8a4361812e.jpg","hints/769817a592b3.jpg","hints/b7b113266192.jpg","hints/de71607a7785.jpg","hints/79db0f43a991.jpg","hints/24a2055166cb.jpg","hints/a412a8e4ad22.jpg","hints/2c485bd9726b.jpg","hints/1b975ede1a43.gif"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
  caches.open(CACHE).then((c) => Promise.all(HINT_PHOTOS.map((u) => c.add(u).catch(() => {})))).catch(() => {});
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => (k.startsWith("mimica-") || k.startsWith("festa-")) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Páginas: tentam a rede (pra pegar versão nova) e caem pro cache se estiver offline.
// Demais arquivos (scripts, ícones, fontes do Google): cache primeiro.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("index.html")))
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
