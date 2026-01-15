# Legal Document Editor (Tip-tap + Next.js)

A WYSIWYG editor designed for legal document drafting with real-time, print-accurate pagination. Built with **Next.js 14**, **Tiptap**, and **Tailwind CSS**.

**Live Demo:** [Deployed on Vercel](https://tiptap-legal-editor-fzmszvsa7-mryumeths-projects.vercel.app/)

---

## ✨ Features

- **Real-time Pagination:** Visualizes page breaks as you type, matching US Letter standards (8.5" x 11").
- **WYSIWYG Printing:** The editor output matches the browser's PDF export exactly (1-inch margins).
- **Automatic Page Numbering:** Dynamic page numbers appear at the bottom of every page.
- **Smart Reflow:** Content automatically flows to the next page when editing or pasting text.

---

## 🛠 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Editor:** [Tiptap](https://tiptap.dev/) (Headless wrapper for ProseMirror)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + `@tailwindcss/typography`
- **Deployment:** [Vercel](https://vercel.com)

---

## ⚙️ Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone [https://github.com/mrYumeth/tiptap-legal-editor.git](https://github.com/mrYumeth/tiptap-legal-editor.git)
   cd tiptap-legal-editor

   ```

2. **Install dependencies:**
   npm install

   # or

   yarn install

3. **Run the development server:**
   npm run dev

🧠 **Technical Approach to Pagination**
Achieving real-time pagination in a web editor is challenging because the DOM (Document Object Model) does not inherently have a concept of "pages." Here is how we solved it:

1. **DOM-Based Measurement**
   Instead of estimating height based on character count, we measure the actual rendered height of every top-level block (paragraphs, headings) using getBoundingClientRect(). This ensures that font styles, line wrapping, and margins are accurately accounted for.

2. **ProseMirror Plugin**
   We implemented a custom Tiptap extension (PageBreakExtension.ts) that runs a ProseMirror Plugin.

View Layer Logic: The plugin iterates through the document's nodes.

Accumulation: It accumulates the height of each node against a fixed "Content Height" (864px for US Letter with 1" margins).

Decoration Widgets: When a node exceeds the page boundary, we insert a Decoration Widget (a visual "Page Break" div) into the editor view without altering the actual document content.

3. **Print Simulation**
   To ensure WYSIWYG (What You Get Is What You See), we use strict CSS rules:

Screen: The editor container is fixed to 816px (8.5 inches) with 96px (1 inch) padding.

Print: We use @media print to force the browser margins to zero and apply a physical 1in padding to the body. This prevents the browser's default printer settings from shifting the layout.

⚖️ **Trade-offs & Limitations**

1. Block-Level Pagination: Currently, the system pushes an entire block (e.g., a paragraph) to the next page if it doesn't fit. It does not yet "split" a single text node across two pages (e.g., half a paragraph on Page 1, half on Page 2).

2. Performance: Measuring DOM nodes on every keystroke can be expensive. We mitigated this using requestAnimationFrame and debouncing, but extremely large documents (100+ pages) might see performance impacts.

3. Browser Dependency: Layouts rely on the browser's rendering engine. Minor differences in font rendering between browsers (Chrome vs. Firefox) could theoretically shift a line break, though our fixed-width approach minimizes this.

🚀 **Future Improvements**
With more time, I would prioritize the following enhancements:

1. Header & Footer Support: Implement editable headers and footers that repeat on every page (or specific pages).

2. Table Support: Add a Tiptap Table extension with logic to handle row-breaking across pages gracefully.

3. Better Page Break Handling: Implement logic to split long text blocks (paragraphs) into two separate nodes so text can flow continuously across pages rather than pushing the whole block.

4. Advanced Page Layouts: Support for different page sizes (A4, Legal) and custom margin configurations.
