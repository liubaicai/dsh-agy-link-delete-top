import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const clientSrc = readFileSync(new URL("../src/client.js", import.meta.url), "utf8");

function newDom() {
  return new JSDOM("<!doctype html><html><head></head><body><div id='app'></div></body></html>", {
    runScripts: "outside-only",
  });
}

function loadClient(dom) {
  const loads = [];
  dom.window.__ModuleLoader__ = { load: (spec) => loads.push(spec) };
  dom.window.eval(clientSrc);
  assert.equal(loads.length, 1, "client registers exactly one module");
  return loads[0];
}

function applyAndRun(spec, dom) {
  const api = spec.factory();
  const cleanups = [];
  api.apply({ effect: (fn) => { cleanups.push(fn()); return () => {}; } });
  assert.equal(
    dom.window.document.querySelectorAll("style[data-plugin='dsh-agy-link-delete-top']").length,
    1,
    "style injected exactly once",
  );
  return { api, cleanups };
}

/** Build a button styled like the AGY session status badge (agy-link 0.4.70). */
function badgeLike(dom, { title = "Antigravity：1 个账号已就绪 · 点击打开控制台", bgVar = "--agy-bg-header", cls = "agy-btn" } = {}) {
  const b = dom.window.document.createElement("button");
  b.className = cls;
  b.title = title;
  b.textContent = "AGY · 主账号（系统登录）";
  b.setAttribute(
    "style",
    `background: var(${bgVar}); border: 1px solid var(--agy-border-card); border-radius: 999px;`,
  );
  return b;
}

const hidden = "none";

test("hides the AGY session badge and its wrapper", () => {
  const dom = newDom();
  const { api } = applyAndRun(loadClient(dom), dom);
  assert.equal(api.name, "agy-link-delete-top");
  const wrapper = dom.window.document.createElement("div");
  wrapper.appendChild(badgeLike(dom));
  dom.window.document.body.appendChild(wrapper);
  assert.equal(dom.window.getComputedStyle(wrapper).display, hidden);
  assert.equal(dom.window.getComputedStyle(wrapper.firstChild).display, hidden);
});

test("badge without the AGY header background variable stays visible", () => {
  const dom = newDom();
  applyAndRun(loadClient(dom), dom);
  const button = badgeLike(dom, { bgVar: "--agy-bg-panel" });
  dom.window.document.body.appendChild(button);
  assert.notEqual(dom.window.getComputedStyle(button).display, hidden);
});

test("badge with a non-Antigravity title stays visible", () => {
  const dom = newDom();
  applyAndRun(loadClient(dom), dom);
  const button = badgeLike(dom, { title: "其他插件按钮" });
  dom.window.document.body.appendChild(button);
  assert.notEqual(dom.window.getComputedStyle(button).display, hidden);
});

test("wrapper containing extra siblings is never hidden", () => {
  const dom = newDom();
  applyAndRun(loadClient(dom), dom);
  const wrapper = dom.window.document.createElement("div");
  wrapper.appendChild(badgeLike(dom));
  wrapper.appendChild(dom.window.document.createElement("button"));
  dom.window.document.body.appendChild(wrapper);
  assert.notEqual(dom.window.getComputedStyle(wrapper).display, hidden);
});

test("console controls rendered to body stay visible", () => {
  const dom = newDom();
  applyAndRun(loadClient(dom), dom);
  const portal = dom.window.document.createElement("div");
  const close = badgeLike(dom, { title: "关闭", bgVar: "--agy-bg-panel" });
  portal.appendChild(close);
  dom.window.document.body.appendChild(portal);
  assert.notEqual(dom.window.getComputedStyle(close).display, hidden);
  assert.notEqual(dom.window.getComputedStyle(portal).display, hidden);
});

test("dispose removes the injected style", () => {
  const dom = newDom();
  const spec = loadClient(dom);
  const api = spec.factory();
  const cleanups = [];
  api.apply({ effect: (fn) => { cleanups.push(fn); return () => {}; } });
  const dispose = cleanups[0]();
  assert.equal(typeof dispose, "function");
  dispose();
  assert.equal(
    dom.window.document.querySelectorAll("style[data-plugin='dsh-agy-link-delete-top']").length,
    0,
    "style removed after dispose",
  );
});
