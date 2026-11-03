// Set to true, rebuild and restart the preview to restore Journal and Team login.
// Article content and Studio configuration remain intact while paused.
export const JOURNAL_ENABLED = false;

// Services and Cases are paused at client request: links are removed or made
// inert and direct visits show a maintenance page. Page sources stay intact.
// Build with SHOW_PAUSED_SECTIONS=1 to preview them locally while editing.
export const PAUSED_SECTIONS = process.env.SHOW_PAUSED_SECTIONS
  ? []
  : ["/services/", "/work/"];
