const path = require("path"),
	fs = require("fs").promises;

let elems = {
	Container: document.createElement("button"),
	NIcons: document.createElement("section"),
	Clock: document.createElement("clock"),
	Date: document.createElement("date")
};
root.className = "d-flex align-items-center"
elems.Container.className = "btn btn-dark shadow-sm p-2 d-flex align-items-stretch";
elems.Container.title = "Tray (<i class='mdi mdi-atom'></i>+N)";
elems.NIcons.className = "fly left show d-inline-flex";
elems.Date.className = "pr-1 fly left show lh-r1 d-none";
elems.Clock.className = "pl-1 lh-r1 font-weight-bold";
elems.Clock.style.height = "19px";
elems.Container.addEventListener("click", e => {
	e.stopPropagation();
	let win = AppWindow.getFocusedWindow();
	if(win) win.blur();
	Elements.MenuBar.toggle()
});
elems.Container.append(elems.Date, elems.NIcons, elems.Clock);
root.appendChild(elems.Container);
BSN.Tooltip(elems.Container);

setInterval(function() {
	elems.Clock.innerText = new Date().toLocaleTimeString({}, {
		hour: '2-digit',
		minute: '2-digit'
	});
	elems.Date.innerText = new Date().toLocaleDateString({}, {
		weekday: 'long',
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}, 1000);

window.TrayItem = class TrayItem {
	constructor(icon) {
		let iconSize = 18;
		this.elem = document.createElement("icon");
		this.elem.className = `mdi mdi-${icon} mdi-${iconSize}px mr-1 lh-${iconSize} d-flex`;
		elems.NIcons.append(this.elem);
	}
	remove() {
		this.elem.remove();
	}
}

window.addEventListener("keypress", e => {
	if (e.metaKey && e.code === "KeyN") {
		window.__MetaKeyOverriden = true;
		Elements.MenuBar.toggle();
	}
});
let batteryLevel = document.createElement("div");
batteryLevel.className = "ml-1 lh-r1";
batteryLevel.innerText = "78%";
new TrayItem("battery-80").elem.append(batteryLevel);

fs.readFile(__dirname + "/menu.js", "utf-8").then(code => {
	new Function('root', '__dirname', code)(root, __dirname);
});
return elems;
