/**
 * EPUB Styles - CSS for EPUB content
 */

/** Get default EPUB CSS styles */
export function getEpubStyles(): string {
  return `body {
  font-family: Georgia, serif;
  line-height: 1.6;
  margin: 1em;
}

h1 {
  text-align: center;
  margin-bottom: 1em;
}

p {
  text-indent: 1em;
  margin: 0.5em 0;
}

.chapter-header {
  margin-bottom: 2em;
  text-align: center;
}

.book-title {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 0.5em;
}

.author, .translator {
  font-size: 0.85em;
  color: #888;
  margin: 0.25em 0;
}

.chapter-title {
  font-size: 1.5em;
  margin-top: 1em;
}

.chapter-content {
  margin-top: 1em;
}

/* Table of Contents */
.toc-title {
  text-align: center;
  margin-bottom: 1.5em;
}

.toc-list {
  list-style-type: none;
  padding-left: 0;
}

.toc-list li {
  margin: 0.5em 0;
  padding: 0.25em 0;
  border-bottom: 1px solid #eee;
}

.toc-list a {
  text-decoration: none;
  color: #333;
}

.toc-list a:hover {
  color: #0066cc;
}`;
}

/** Get CJK-optimized CSS with @font-face for embedded font */
export function getCjkStyles(fontFileName: string): string {
  return `@font-face {
  font-family: 'EmbeddedCJK';
  src: url('fonts/${fontFileName}');
  font-weight: normal;
  font-style: normal;
}

body {
  font-family: 'EmbeddedCJK', sans-serif;
  line-height: 1.7;
  margin: 1em;
  text-align: justify;
}

p {
  text-indent: 2em;
  margin: 0.5em 0;
}

h1, h2, h3 {
  font-family: 'EmbeddedCJK', sans-serif;
  font-weight: bold;
  text-align: left;
  margin-top: 2em;
  margin-bottom: 1em;
  line-height: 1.4;
}

.chapter-header {
  margin-bottom: 2em;
  text-align: center;
}

.book-title {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 0.5em;
}

.author, .translator {
  font-size: 0.85em;
  color: #888;
  margin: 0.25em 0;
}

.chapter-title {
  font-size: 1.5em;
  margin-top: 1em;
}

.chapter-content {
  margin-top: 1em;
}

.toc-title {
  text-align: center;
  margin-bottom: 1.5em;
}

.toc-list {
  list-style-type: none;
  padding-left: 0;
}

.toc-list li {
  margin: 0.5em 0;
  padding: 0.25em 0;
  border-bottom: 1px solid #eee;
}

.toc-list a {
  text-decoration: none;
  color: #333;
}

.toc-list a:hover {
  color: #0066cc;
}`;
}
