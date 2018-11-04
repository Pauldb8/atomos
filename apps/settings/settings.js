const fs = require('fs').promises;
const path = require('path');
let sectionHistory = [];
root.footer = document.createElement("footer");
if (!isMobile)
	root.footer.className = "shadow-lg d-flex border-top flex-shrink-0";
else
	root.footer.className = "d-flex border-bottom flex-shrink-0";
root.footer.backButton = document.createElement("button");
root.footer.backButton.className = "m-2 lh-24 p-1 mdi mdi-24px mdi-arrow-left btn btn-white rounded-circle d-flex";
root.footer.backButton.onclick = e => {
	sectionHistory.pop()
	openSection(sectionHistory[sectionHistory.length - 1], false);
};
root.footer.header = document.createElement("div");
root.footer.header.className = "h5 m-0 flex-grow-1 d-flex align-items-center";
root.footer.header.innerText = "Settings";
root.footer.append(root.footer.backButton, root.footer.header);
root.body = document.createElement("main");
root.body.className = "flex-grow-1 d-flex flex-column py-2 flex-nowrap scrollable-y";
root.append(root.body, root.footer);

function newSmallListItem(options) {
	let elem = document.createElement("label");
	if (options.type === "checkbox") {
		elem.className = "list-group-item rounded-0 list-group-item-action border-left-0 border-right-0 d-flex align-items-center py-2 custom-control custom-checkbox";
		elem.input = document.createElement("input");
		elem.input.type = "checkbox";
		elem.input.id = shell.uniqueId();
		elem.input.checked = options.checked;
		elem.input.className = "custom-control-input";
		elem.label = document.createElement("div");
		elem.label.innerHTML = `<div>${options.label}</div>`;
		if (options.sublabel) elem.label.innerHTML += `<div class='text-muted small'>${options.sublabel}</div>`
		elem.htmlFor = elem.input.id;
		elem.label.className = "custom-control-label d-flex flex-column w-100";
		elem.append(elem.input, elem.label);
		elem.input.onchange = e => options.click(elem.input.checked);
	} else if (options.type === "header") {
		elem.className = "bg-light lh-r1 font-weight-bolder dropdown-header";
		elem.innerText = options.label;
	} else {
		elem.className = "list-group-item rounded-0 list-group-item-action border-left-0 border-right-0 d-flex align-items-center py-2";
		elem.header = document.createElement('div');
		if (options.icon) {
			elem.icon = document.createElement('icon');
			elem.icon.className = "rounded p-1 mdi mdi-18px text-white mdi-" + options.icon + " mr-2 lh-18 d-flex";
			elem.icon.style.backgroundColor = options.color;
			elem.append(elem.icon);
			elem.onclick = options.click;
		}
		elem.onclick = options.click;
		elem.header.innerHTML = `<div>${options.label}</div>` + (options.sublabel ? `<div class='small text-muted'>${options.sublabel}</div>` : "");
		elem.append(elem.header);

	}
	return elem;
}
async function openSection(id, log = true) {
	if (!id) {
		root.classList.remove("show");
		setTimeout(e => root.remove(), FADE_ANIMATION_DURATION);
		window.__settingsInst = undefined;
		return;
	}

	function setTitle(title) {
		root.footer.header.innerText = title;
	}

	let sectionPath = path.join(osRoot, "apps", "settings", "sections", id + ".js");
	root.body.innerHTML = "";
	if (root.footer.specialButton) root.footer.specialButton.remove();
	await new AsyncFunction('root', 'setTitle', 'setActionButton', 'goBack', 'openSection', 'newSmallListItem', await fs.readFile(sectionPath))(root.body, setTitle, setActionButton, root.footer.backButton.click, openSection, newSmallListItem);
	if (log) sectionHistory.push(id);
	console.log(sectionHistory)
}

function setActionButton(elem) {
	root.footer.specialButton = elem;
	root.footer.append(root.footer.specialButton);
}

if (this.sectionToOpen) openSection(sectionToOpen); else
openSection("menu");