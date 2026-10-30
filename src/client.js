window.__ModuleLoader__.load({
  id: "dsh-agy-link-delete-top",
  factory: () => {
    const name = "agy-link-delete-top";
    // AGY 0.4.70: title prefix is stable in all four locales. The background
    // variable distinguishes this badge from other AGY buttons. Do not match
    // account names, remove React nodes, or unregister the modal host.
    const badge = 'button.agy-btn[title^="Antigravity"][style*="--agy-bg-header"]';
    const css = `
${badge} {
  display: none !important;
}
/* Collapse only the badge's dedicated single-child wrapper. Portals render
   into document.body, so the console remains mounted and usable. */
div:has(> ${badge}):not(:has(> :not(${badge}))) {
  display: none !important;
}
`;
    function apply(ctx) {
      ctx.effect(() => {
        const style = document.createElement("style");
        style.dataset.plugin = "dsh-agy-link-delete-top";
        style.textContent = css;
        document.head.appendChild(style);
        return () => style.remove();
      });
    }
    return { name, inject: [], apply };
  }
});
