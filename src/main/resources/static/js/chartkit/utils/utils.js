/****************************************************
 * ChartKit Utils
 ****************************************************/
(function (global) {
  function $(sel, root = document) {
    return root.querySelector(sel);
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function deepMerge(t, s) {
    if (Array.isArray(s)) return s.slice();
    if (s && typeof s === "object") {
      const out = { ...(t || {}) };
      for (const k of Object.keys(s)) out[k] = deepMerge(out[k], s[k]);
      return out;
    }
    return s;
  }

  function fmtNum(n) {
    return n == null || !isFinite(n)
      ? "-"
      : new Intl.NumberFormat("en-US", {
          useGrouping: true,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(n));
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function toISO_utc(date) {
    return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(
      date.getUTCDate()
    )}T${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:00Z`;
  }

  function fmtISO_ymd_hm_utc(iso) {
    const d = new Date(iso);
    return `${d.getUTCFullYear()}/${pad2(d.getUTCMonth() + 1)}/${pad2(
      d.getUTCDate()
    )} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
  }

  function fmtISO_ymd_utc(iso) {
    const d = new Date(iso);
    return `${d.getUTCFullYear()}/${pad2(d.getUTCMonth() + 1)}/${pad2(
      d.getUTCDate()
    )}`;
  }

  function formatForInterval(iso, interval) {
    const tf = (interval || "").toLowerCase();
    return ["1d", "1w", "1wk", "1week"].includes(tf)
      ? fmtISO_ymd_utc(iso)
      : fmtISO_ymd_hm_utc(iso);
  }

  // ✅ Define global ChartKitUtils
  global.ChartKitUtils = {
    $, byId, deepMerge, fmtNum,
    pad2, toISO_utc,
    fmtISO_ymd_hm_utc, fmtISO_ymd_utc,
    formatForInterval
  };
})(window);
