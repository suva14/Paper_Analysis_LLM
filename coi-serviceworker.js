/*! coi-serviceworker v0.1.7 */
let coepCredentialless = false;
if (typeof window === 'undefined') {
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
  self.addEventListener("fetch", function (event) {
    if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") return;
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response.status === 0) return response;
        const newHeaders = new Headers(response.headers);
        newHeaders.set("Cross-Origin-Embedder-Policy", coepCredentialless ? "credentialless" : "require-corp");
        if (!newHeaders.get("Cross-Origin-Opener-Policy")) newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers: newHeaders });
      }).catch((e) => console.error(e))
    );
  });
} else {
  (() => {
    const reloadedBySelf = window.sessionStorage.getItem("coiReloadedBySelf");
    if (reloadedBySelf) { window.sessionStorage.removeItem("coiReloadedBySelf"); return; }
    const n = navigator;
    if (n.serviceWorker && n.serviceWorker.controller) { 
        n.serviceWorker.controller.postMessage({ type: "coi-check" }); 
    } else { 
        !async function () { 
            // MODIFICATION ICI : Ajout du "./" pour forcer le chemin relatif
            await n.serviceWorker.register("./coi-serviceworker.js"); 
            window.sessionStorage.setItem("coiReloadedBySelf", "true"); 
            window.location.reload(); 
        }(); 
    }
  })();
}