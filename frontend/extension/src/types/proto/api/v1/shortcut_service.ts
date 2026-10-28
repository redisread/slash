import type { Visibility } from "./common";

// JSON fields consumed by the extension from the REST API.
export interface Shortcut {
  id: number;
  name: string;
  title: string;
  link: string;
  tags: string[];
  visibility: Visibility;
}
export interface ListShortcutsResponse {
  shortcuts: Shortcut[];
}
