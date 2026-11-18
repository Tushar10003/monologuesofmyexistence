# Monologues of my existence

A responsive, animated personal blog library. Each blog is published as a PDF, shown on the site with a cover image and title, and opens in one click.

## What's included

- `index.html` — the website structure
- `styles.css` — responsive layout, typography, animation, and visual styling
- `app.js` — blog loading, search, category filtering, mobile navigation, and interactions
- `blogs.json` — the list of published blog posts (starts empty)
- `pdfs/` — place for your blog PDF files
- `covers/` — place for your blog cover images
- `tools/add_blog.py` — optional helper to copy a PDF/cover into the right folders and update `blogs.json`

## Add a new blog (recommended: use the Python helper)

You need Python 3 installed on your computer. No extra packages are required.

1. Keep your blog as a PDF.
2. Prepare a cover image (JPG, PNG, WEBP, or AVIF). A 4:5 portrait image works well. The site uses a default illustrated cover when you do not provide one.
3. Open a terminal in this project folder and run:

   ```bash
   python tools/add_blog.py --title "The Things We Leave Unsaid" --pdf "path/to/blog.pdf" --cover "path/to/cover.jpg" --category "Reflections" --excerpt "A few lines that invite someone into this piece." --read-time "5 MIN READ"
   ```

   The `--cover`, `--category`, `--excerpt`, `--published`, and `--read-time` options are optional. The publication date defaults to your computer's current date.
4. The helper copies the PDF into `pdfs/`, the cover into `covers/`, and adds the entry to `blogs.json`.
5. Commit and push the updated files to GitHub. The post will appear in the navigation menu and library after GitHub Pages updates.

### Add a blog manually on GitHub

You can also upload the PDF to `pdfs/` and its cover image to `covers/`, then add an object like this to `blogs.json`:

```json
[
  {
    "id": "the-things-we-leave-unsaid",
    "title": "The Things We Leave Unsaid",
    "excerpt": "A few lines that invite someone into this piece.",
    "category": "Reflections",
    "published": "2026-11-18",
    "readTime": "5 MIN READ",
    "pdf": "pdfs/the-things-we-leave-unsaid.pdf",
    "cover": "covers/the-things-we-leave-unsaid.jpg"
  }
]
```

For multiple blogs, add more objects separated by commas inside the array. Make sure each path and file name matches exactly. JSON does not allow comments or a comma after the final object.

## Preview on your computer

Do not open `index.html` by double-clicking it, because browsers restrict loading `blogs.json` from a `file://` address. Start a tiny local web server from the project folder instead:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000> in your browser. Stop the server with `Ctrl+C`.

## Deploy to GitHub Pages

1. Create a new repository on GitHub. A public repository is the simplest option for a free GitHub Pages site.
2. Upload the contents of this project folder to the repository's root. `index.html` should be at the top level, not inside another nested folder.
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose the `main` branch and the `/ (root)` folder, then save.
6. GitHub will publish the site and show its URL on the Pages settings screen. It is usually `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.
7. Whenever you add a blog, upload the PDF, cover, and updated `blogs.json` (or run the Python helper locally and push its changes). GitHub Pages will redeploy automatically.

## Important hosting note

GitHub Pages is a static hosting service. It serves HTML, CSS, JavaScript, JSON, images, and PDFs, but it does not run a Python, Java, or C++ server for this website. The live experience therefore uses HTML, CSS, and JavaScript. The included Python script is an optional local publishing helper; it runs on your own computer and prepares the files before you push them to GitHub. Java and C++ are not needed for a static blog site. A live backend in those languages would require a separate server or hosting platform.

## A few useful details

- PDFs open in a new browser tab, so visitors can read or download them using their browser's built-in PDF viewer.
- The site works on mobile, tablet, and desktop screen sizes.
- The search box supports `/` as a keyboard shortcut. Press `Escape` to close the navigation menu.
- The layout respects the device's reduced-motion accessibility setting.
- Use relative paths such as `pdfs/my-blog.pdf` and `covers/my-cover.jpg`. This keeps the site compatible with GitHub project pages.
