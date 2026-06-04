
Please refactor our current frontend page components and backend API endpoints using Next.js, Tailwind CSS, TypeScript, and a powerful editor framework library (such as Tiptap, Slate.js, or Quill).

Implement the following comprehensive feature upgrades:

1. COMPREHENSIVE TEXT EDITOR UPGRADE (WYSIWYG Layer):
   - Replace the old 'Konten' textarea with a rich text block editor interface.
   - The toolbar must include complete formatting controls as seen in {8A484E81-17D3-4AF7-B3D9-E29AF6B090ED}.png:
     * Basic typography: Bold, Italic, Underline, Font-family selector (e.g., Apple System, Inter), and Font-size selector (e.g., 15px, 16px).
     * Alignment options: Left, Center, Right, Justify.
     * Elements: Bullet lists, Numbered lists, Horizontal line dividers, Undo, Redo, Fullscreen toggle.
     * Tables Extension: Crucial integration to create, insert, add rows/columns, and render HTML tables cleanly. This replaces messy manual Markdown table formats and prevents rendering text glitches on the client-side.
     * Maintain the "Optimasi dengan AI" button, positioning it cleanly near the editor workspace to enhance text via the LLM API.

2. MEDIA HANDLING & DRAG-AND-DROP UPLOAD UPGRADE:
   - Replace the raw "URL Gambar" text input string with an interactive image upload section.
   - Design an upload card layout containing a responsive placeholder box (16:9 ratio optimized for 1600x900 resolution, max file size < 5MB).
   - Integrate a "Unggah" (Upload) action button linked to our media storage API (e.g., Cloudinary or Vercel Blob Storage).
   - Add a dedicated field below it labeled "Kredit/Teks:" for image captions and copyright disclaimers (with a default hint "Salin/rekat bila perlu -> ©").

3. METADATA & INTERNATIONALIZATION CONTROL:
   - Retain the Article Title, Auto-generated URL Slug, and Publish Date/Time inputs, styling them uniformly with TCO's dark aesthetic palette.
   - Insert a Language Dropdown Selector right under the Permalink section (supporting Options: "Indonesian", "English", etc.) to save the localization locale tag in the database schema.
   - Keep the "PGN Game" data block input intact so admins can still paste PGN chess raw arrays or strings seamlessly.

4. DATABASE SCHEMA EXTENSION & SANITIZATION:
   - Ensure the updated payload sent to our backend submission endpoint (`/api/articles/create`) supports the new rich-text HTML string structure, language property string, image caption, and main cover image file CDN URL.
   - Apply robust server-side sanitization (e.g., using 'dompurify' or 'sanitize-html') on the rich text content body to prevent XSS vulnerabilities before storage.

Generate the clean, ready-to-use React frontend component file alongside its configuration layout code. Avoid truncated blocks or empty mock actions.