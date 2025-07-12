// -- DEFINE TOOLBAR LAYOUTS --
const desktopToolbar = [
  ["undo", "redo"],
  // ["font", "fontSize", "formatBlock"],
  // ["paragraphStyle", "blockquote"],
  ["formatBlock", "blockquote"],
  ["bold", "underline", "italic", "strike", "subscript", "superscript"],
  ["fontColor", "hiliteColor", "textStyle"],
  ["removeFormat"],
  ["outdent", "indent"],
  ["align", "horizontalRule", "list", "lineHeight"],
  ["table", "link", "image", "video", "audio"],
  ["fullScreen", "showBlocks", "codeView"],
  ["preview", "print"],
];

const mobileToolbar = [
  ["undo", "redo"],
  ["formatBlock"],
  [
    ":r-Format-default.more_text",
    // "font",
    // "fontSize",
    // "formatBlock",
    "bold",
    "underline",
    "italic",
    "fontColor",
    "hiliteColor",
    "removeFormat",
  ],
  [
    ":l-Paragraph-default.more_paragraph",
    // "paragraphStyle",
    "blockquote",
    "outdent",
    "indent",
    "align",
    "list",
    // "lineHeight",
  ],
  [
    ":i-Insert-default.more_plus",
    "table",
    "link",
    "image",
    "video",
    "audio",
    "horizontalRule",
  ],
  ["fullScreen", "codeView"],
];

// -- EDITOR INITIALIZATION --
const isMobile = window.innerWidth < 768;

const editor = SUNEDITOR.create("editor", {
  buttonList: isMobile ? mobileToolbar : desktopToolbar,
  width: "100%",
  height: "auto",
  minHeight: "250px",
  placeholder: "Start writing here...",
  defaultTag: "p",

  // **CRITICAL FIX FOR SELECTION ISSUES**
  // These callbacks help maintain focus, especially on mobile.
  callBackSave: function () {
    // When the editor saves, it can lose focus. This brings it back.
    this.core.focus();
  },
  onImageUpload: function () {
    // Explicitly focus the editor before the image upload dialog appears.
    // This helps ensure the image is inserted at the correct cursor position.
    this.core.focus();
  },
});

// **RE-IMPLEMENTED IOS SELECTION FIX**
// This is the most important part for fixing the paragraph/image insertion bug.
// It applies to both iOS and can benefit Android in some cases.
function applyMobileFocusFix() {
  const toolbar = editor.core.context.tool.bar;
  if (toolbar) {
    // We listen for a "touchend" event on the entire toolbar.
    toolbar.addEventListener("touchend", (e) => {
      // When the touch ends (i.e., user lifts their finger),
      // we immediately refocus on the editor's writable area.
      editor.core.focus();
    });
  }
}

// Apply the fix right after the editor is created.
applyMobileFocusFix();

// -- RESPONSIVE LOGIC TO SWITCH TOOLBARS --
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const currentWidth = window.innerWidth;
    const isMobileView = currentWidth < 768;
    const currentToolbar = editor.options.buttonList;

    if (isMobileView && currentToolbar !== mobileToolbar) {
      editor.setOptions({ buttonList: mobileToolbar });
      applyMobileFocusFix(); // Re-apply the fix after rebuilding the toolbar
    } else if (!isMobileView && currentToolbar !== desktopToolbar) {
      editor.setOptions({ buttonList: desktopToolbar });
    }
  }, 100);
});

// A workaround for WebKit's selection issues.
// This ensures that the selection is properly recognized before the editor's command is executed.
editor.core.context.element.wysiwyg.addEventListener("touchend", function () {
  editor.core.context.element.wysiwyg.focus();
});

function loadContentFromFile(fileName) {
  fetch(`assets/${fileName}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then((html) => {
      editor.setContents(html);
    })
    .catch((error) => {
      console.error("Error loading content:", error);
      // Fallback content
      const fallbackContent = `
                        <h1>Welcome to SunEditor</h1>
                        <p>This is a fallback content. When running on a server, this will be replaced with content from the file.</p>
                        <ul>
                            <li>You can edit this content.</li>
                            <li>Try out different formatting options.</li>
                            <li>Experiment with inserting images or links.</li>
                        </ul>
                    `;
      editor.setContents(fallbackContent);
    });
}

// Load content after editor initialization
editor.onload = function (core) {
  console.log("Attempting to load content file...");
  loadContentFromFile("content.html");

  // Add toolbar fixing functionality
  const toolbar = core.context.element.toolbar;
  const topArea = core.context.element.topArea;
  let isToolbarFixed = false;

  function fixToolbar() {
    if (!isToolbarFixed) {
      const toolbarRect = toolbar.getBoundingClientRect();
      const topAreaRect = topArea.getBoundingClientRect();

      toolbar.style.position = "fixed";
      toolbar.style.top = "0";
      toolbar.style.left = `${topAreaRect.left}px`;
      toolbar.style.width = `${topAreaRect.width}px`;
      toolbar.style.zIndex = "1000";
      topArea.style.paddingTop = `${toolbarRect.height}px`;

      isToolbarFixed = true;
    }
  }

  function unfixToolbar() {
    if (isToolbarFixed) {
      toolbar.style.position = "";
      toolbar.style.top = "";
      toolbar.style.left = "";
      toolbar.style.width = "";
      toolbar.style.zIndex = "";
      topArea.style.paddingTop = "";

      isToolbarFixed = false;
    }
  }

  // Fix toolbar when editor is focused
  core.context.element.wysiwyg.addEventListener("focus", fixToolbar);

  // Unfix toolbar when editor loses focus
  core.context.element.wysiwyg.addEventListener("blur", unfixToolbar);

  // Handle scroll events
  window.addEventListener("scroll", () => {
    if (document.activeElement === core.context.element.wysiwyg) {
      fixToolbar();
    } else {
      unfixToolbar();
    }
  });

  // Handle resize events
  window.addEventListener("resize", () => {
    if (isToolbarFixed) {
      const topAreaRect = topArea.getBoundingClientRect();
      toolbar.style.left = `${topAreaRect.left}px`;
      toolbar.style.width = `${topAreaRect.width}px`;
    }
  });
};
