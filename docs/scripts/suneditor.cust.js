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
  [
    // "fullScreen",
    "showBlocks",
    "codeView",
  ],
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
  [
    "codeView",
    // "fullScreen",
  ],
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

const viewport = window.visualViewport;
let height = viewport.height;
let device = "Desktop";

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

if (isMobileDevice()) {
  // For mobile devices, use the maximum of inner height and viewport height
  height = Math.max(window.innerHeight, viewport.height);
} else {
  // For desktop, just use the viewport height
  height = viewport.height;
}

const editorContainer = document.getElementsByClassName("editor-container")[0];
const seWrapper = document
  .getElementsByClassName("sun-editor")[0]
  .querySelector(".se-wrapper");
const seWrapperCode = document
  .getElementsByClassName("sun-editor")[0]
  .querySelector(".se-wrapper")
  .querySelector(".se-wrapper-code");

window.visualViewport.addEventListener("resize", resizeHandler);

function resizeHandler() {
  // button.style.bottom = `${height - viewport.height + 10}px`;

  editorContainer.style.height = `${viewport.height - 8}px`;
  seWrapper.style.height = `${viewport.height - 68}px`;
  seWrapperCode.style.height = `${viewport.height - 68}px`;

  // console.log("Height: ", height, " viewport.height", viewport.height);
  // editor.setContents(`
  //   <h3>Viewport Information:</h3>
  //   <p><strong>Initial Height:</strong> ${height}px</p>
  //   <p><strong>Current Viewport Height:</strong> ${viewport.height}px</p>
  //   <p><strong>Difference:</strong> ${height - viewport.height}px</p>
  //   <p><strong>Device:</strong> ${navigator.userAgent}</p>
  //   <p><br>
  //   </p>
  //   <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et doloremagna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodoconsequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. <p>
  //   <p><br>
  //   </p>
  //   <p>                       Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temporincididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laborisnisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillumdolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officiadeserunt mollit anim id est laborum.</p>
  //   <p><br>
  //   </p>
  //   <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et doloremagna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodoconsequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. <p>
  //   <p><br>
  //   </p>
  //   <p>                       Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temporincididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laborisnisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillumdolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officiadeserunt mollit anim id est laborum.</p>
  //   <p><br>
  //   </p>
  //   <p><br>
  //   </p>
  //   <p>                    </p>
  // `);
}

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
                        <h1>Text editor demo - SunEditor</h1>
                        <p>
                          This is a comprehensive demonstration of SunEditor's capabilities. Feel free
                          to experiment with the various formatting options and features available.
                        </p>
                        <h2>Text Formatting</h2>
                        <p>
                          You can make text <strong>bold</strong>, <em>italic</em>, <u>underlined</u>,
                          or <strike>strikethrough</strike>. You can also use <sup>superscript</sup> and
                          <sub>subscript</sub>.
                        </p>
                        <h2>Lists</h2>
                          <h3>Unordered List:</h3>
                          First item
                          Second item
                          Third item
                          <h3>Ordered List:</h3>
                          First item
                          Second item
                          Third item
                        <h2>Table</h2>
                        <table>
                          <thead>
                            <tr>
                              <th>
                                <div>Header A</div>
                              </th>
                              <th>
                                <div>Header B</div>
                              </th>
                              <th>
                                <div>Header C</div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>
                                <div>A1</div>
                              </td>
                              <td>
                                <div>B1</div>
                              </td>
                              <td>
                                <div>C1</div>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <div>A2</div>
                              </td>
                              <td>
                                <div>B2</div>
                              </td>
                              <td>
                                <div>C2</div>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <div>A3</div>
                              </td>
                              <td>
                                <div>B3</div>
                              </td>
                              <td>
                                <div>C3</div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <h2>Links</h2>
                        <p>You can add <a href="https://github.com/JiHong88/SunEditor" target="_blank">links to external websites</a>.</p>
                        <h2>Images</h2>
                        <p>You can insert images:</p>
                        <img src="https://via.placeholder.com/300x200" alt="Placeholder Image" style="max-width: 100%; height: auto;">
                        <h2>Code View</h2>
                        <p>SunEditor also provides a code view for those who prefer to work directly with HTML:</p>
                        <pre><code>&lt;p&gt;This is a code block. You can switch to code view to edit HTML directly.&lt;/p&gt;</code></pre>
                        <h2>Experiment!</h2>
                        <p>Feel free to edit this content, try out different formatting options, and explore all the features SunEditor has to offer!</p>
                        <p><br>
                        </p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                        <p><br>
                        </p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

                        <p><br>
                        </p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. </p>
                        <p><br>
                        </p>
                        <p>                       Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                        <p><br>
                        </p>
                        <p><br>
                        </p>
                        <p>                    </p>
                    `;
      editor.setContents(fallbackContent);
    });
}

// Load content after editor initialization
editor.onload = function (core) {
  console.log("Attempting to load content file...");
  loadContentFromFile("content.html");
};
