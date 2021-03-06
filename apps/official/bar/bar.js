const Menu = require("@api/Menu"), Registry = require("@api/Registry");
const fs = require("fs").promises;
if (!Registry.get("taskbar.items"))
    Registry.set('taskbar.items', ["official/start", "official/tasker", "official/batterymeter", "official/tray"]);
let autoHide = Registry.get("taskbar.autoHide") || false;
Registry.watch("taskbar", updatePosition);
render();

function render() {
	Elements.Bar = document.createElement("footer");
	Elements.Bar.id = "taskbar";
	Elements.BarItems = {};
	loadPlugins().then(() => {
		/*setTimeout(() => {
			if(Registry.get("system.enableSimpleEffects") === true)
				document.querySelector("splash").remove();
			else {
				document.querySelector("splash").classList.add("fade");
				setTimeout(() => document.querySelector("splash").remove(), 1000);
			}
		}, 1000);*/
		//console.clear();
	});
	Elements.Bar.className = "px-2 pt-1 pb-2 d-flex flex-nowrap mt-auto flex-shrink-0 position-absolute";
	Elements.Bar.transition = "bottom 1s ease";
	Elements.Bar.style.top = "calc(var(--taskbar-y) - var(--taskbar-height))";
	updatePosition();
	window.addEventListener("resize", updatePosition);
	new ResizeObserver(updatePosition).observe(Elements.Bar);
	Elements.Bar.menu = new Menu([{
		type: "checkbox",
		label: "Automatically hide taskbar",
		checked: autoHide || false,
		click() {
			Registry.set("taskbar.autoHide", !autoHide)
		}
	}]);
	Elements.Bar.addEventListener("contextmenu", () => {
		Elements.Bar.menu.popup();
		Elements.Bar.keepOpen(true);
		Elements.Bar.menu.once("menu-will-close", () => Elements.Bar.keepOpen(false))
	});
	Elements.Bar.keepOpen = function (bool) { // Not to close in auto-hide mode when sth is happening
		Elements.Bar.classList.toggle("show", bool);
	};
	document.body.appendChild(Elements.Bar);
}

function updatePosition() {
	autoHide = Registry.get("taskbar.autoHide") || false;
	Elements.Bar.classList.toggle("autoHide", autoHide);
	document.body.style.setProperty("--taskbar-height", CSS.px(Elements.Bar.offsetHeight));
	document.body.style.setProperty("--taskbar-hided", autoHide ? "0px" : CSS.px(Elements.Bar.offsetHeight));
	for (const elem of Object.values(Elements.BarItems)) {
		try {
			setTimeout(elem.updatePosition, 100);
		} catch {
		}
	}
}

async function loadPlugins() {
	let items = Registry.get("taskbar.items");
	for (const id of items.values()) {
        let pkg = require(path.join(osRoot, "apps", id, "package.json"));
		if (pkg.type !== "bar-plugin")
			return;
		try {
			let script = await fs.readFile(path.join(osRoot, "apps", id, pkg.main), "utf-8");
			let plugin = document.createElement("plugin");
			Elements.BarItems[id] = await new AsyncFunction("body", "__dirname", script)
			(plugin, path.join(osRoot, "apps", id));
			plugin.id = id;
			Elements.Bar.appendChild(plugin);
		} catch (e) {
			console.error(id, "was not loaded.", e);
		}
	}
}
