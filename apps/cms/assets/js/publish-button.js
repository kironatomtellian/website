/* Wires up the "Publish to website" button in the CMS chrome.
   Add this to every CMS page or to the shared header include:

     <button type="button" class="kat-publish" data-publish>Publish to website</button>
     <div class="kat-publish-toast" data-publish-toast></div>
     <script src="/cms/assets/js/publish-button.js" defer></script>
*/
(function () {
  const btn = document.querySelector("[data-publish]");
  if (!btn) return;
  const toast = document.querySelector("[data-publish-toast]");

  const showToast = (msg, kind) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.dataset.kind = kind || "ok";
    toast.dataset.show = "true";
    setTimeout(() => { toast.dataset.show = "false"; }, 4000);
  };

  btn.addEventListener("click", async () => {
    if (!confirm("Publish the current content to the live website?")) return;
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = "Publishing…";
    try {
      const res = await fetch("/cms/publish.php", { method: "POST", credentials: "same-origin" });
      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch { data = null; }
      if (res.ok && data && data.ok) {
        showToast("Published. Live in seconds.", "ok");
      } else {
        const err = data && data.error ? data.error : (text || `HTTP ${res.status}`);
        showToast("Publish failed: " + err, "error");
      }
    } catch (e) {
      showToast("Publish failed: " + (e && e.message ? e.message : "network error"), "error");
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });
})();
