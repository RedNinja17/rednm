(async function initVisualCMS() {
    async function hashPin(string) {
        const utf8 = new TextEncoder().encode(string);
        const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    const targetHash = await hashPin("2009");
    const sessionToken = sessionStorage.getItem("cms_auth_token");

    if (!sessionToken || sessionToken !== targetHash) {
        return;
    }

    injectCMSStyles();
    createAdminControlBar();

    const editableElements = document.querySelectorAll("[data-cms-id]");
    editableElements.forEach(element => {
        element.setAttribute("contenteditable", "true");
        element.classList.add("cms-editable-element");

        element.addEventListener("blur", () => {
            const cmsId = element.getAttribute("data-cms-id");
            const updatedContent = element.innerHTML;
            stageContentChange(cmsId, updatedContent);
        });
    });
})();

function injectCMSStyles() {
    const style = document.createElement("style");
    style.textContent = `
        .cms-editable-element {
            outline: 1px dashed rgba(255, 92, 92, 0.6) !important;
            transition: outline 0.2s ease, background-color 0.2s ease;
            cursor: text !important;
            pointer-events: auto !important;
            user-select: text !important;
            display: inline-block;
            min-width: 50px;
        }
        .cms-editable-element:hover {
            outline: 2px solid #ff5c5c !important;
            background-color: rgba(255, 92, 92, 0.05) !important;
        }
        .cms-editable-element:focus {
            outline: 2px solid #ff5c5c !important;
            background-color: rgba(255, 92, 92, 0.1) !important;
        }
        .cms-admin-bar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 50px;
            background: #120303;
            border-bottom: 2px solid #ff5c5c;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            font-family: system-ui, sans-serif;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .cms-admin-title {
            color: #ffffff;
            font-size: 0.9rem;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .cms-admin-title span {
            color: #ff5c5c;
        }
        .cms-btn-group {
            display: flex;
            gap: 10px;
        }
        .cms-btn {
            background: rgba(255, 92, 92, 0.1);
            border: 1px solid rgba(255, 92, 92, 0.3);
            color: #ff5c5c;
            padding: 6px 14px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.2s ease;
        }
        .cms-btn:hover {
            background: #ff5c5c;
            color: #ffffff;
        }
        .cms-btn-secondary {
            background: transparent;
            border: 1px solid #444;
            color: #aaa;
        }
        .cms-btn-secondary:hover {
            background: #222;
            color: #fff;
        }
        body {
            padding-top: 50px !important;
        }
    `;
    document.head.appendChild(style);
}

function createAdminControlBar() {
    const bar = document.createElement("div");
    bar.className = "cms-admin-bar";

    const title = document.createElement("div");
    title.className = "cms-admin-title";
    title.innerHTML = "Visual Headless CMS // <span>GitHub Production Gateway</span>";

    const btnGroup = document.createElement("div");
    btnGroup.className = "cms-btn-group";

    const saveBtn = document.createElement("button");
    saveBtn.className = "cms-btn";
    saveBtn.innerText = "Push Commit to GitHub";
    saveBtn.onclick = () => {
        publishToGitHub();
    };

    const logoutBtn = document.createElement("button");
    logoutBtn.className = "cms-btn cms-btn-secondary";
    logoutBtn.innerText = "Exit Editor";
    logoutBtn.onclick = () => {
        sessionStorage.removeItem("cms_auth_token");
        window.location.reload();
    };

    btnGroup.appendChild(logoutBtn);
    btnGroup.appendChild(saveBtn);
    bar.appendChild(title);
    bar.appendChild(btnGroup);
    document.body.appendChild(bar);
}

function stageContentChange(id, content) {
    let staged = JSON.parse(localStorage.getItem("cms_staged_payload")) || {};
    staged[id] = content;
    localStorage.setItem("cms_staged_payload", JSON.stringify(staged));
}

async function publishToGitHub() {
    const payload = JSON.parse(localStorage.getItem("cms_staged_payload"));
    if (!payload || Object.keys(payload).length === 0) {
        alert("No mutations detected to deliver.");
        return;
    }

    if (typeof CMS_CONFIG === "undefined") {
        alert("Configuration Error: cms-config.js was not detected or is missing parameters.");
        return;
    }

    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const apiUrl = `https://api.github.com/repos/${CMS_CONFIG.repoOwner}/${CMS_CONFIG.repoName}/contents/${currentPath}`;

    try {
        const fileResponse = await fetch(`${apiUrl}?ref=${CMS_CONFIG.branch}`, {
            headers: { "Authorization": `token ${CMS_CONFIG.githubToken}` }
        });

        if (!fileResponse.ok) throw new Error("Could not fetch target file layout from GitHub repository.");

        const fileData = await fileResponse.json();
        const fileSha = fileData.sha;
        const rawContent = decodeURIComponent(escape(atob(fileData.content)));

        const parser = new DOMParser();
        const doc = parser.parseFromString(rawContent, "text/html");

        Object.keys(payload).forEach(id => {
            const target = doc.querySelector(`[data-cms-id="${id}"]`);
            if (target) {
                target.innerHTML = payload[id];
            }
        });

        const updatedHtmlString = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
        const encodedContent = btoa(unescape(encodeURIComponent(updatedHtmlString)));

        const commitResponse = await fetch(apiUrl, {
            method: "PUT",
            headers: {
                "Authorization": `token ${CMS_CONFIG.githubToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: `cms: automated visual update to ${currentPath}`,
                content: encodedContent,
                sha: fileSha,
                branch: CMS_CONFIG.branch
            })
        });

        if (commitResponse.ok) {
            alert("Success! Changes committed directly to GitHub repository. Live site will redeploy momentarily.");
            localStorage.removeItem("cms_staged_payload");
            window.location.reload();
        } else {
            const errorDetails = await commitResponse.json();
            alert(`GitHub Deployment API Rejected Write: ${errorDetails.message}`);
        }
    } catch (err) {
        alert(`CMS Deployment pipeline error: ${err.message}`);
    }
}