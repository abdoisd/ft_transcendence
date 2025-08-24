// Utility function to create HTML elements
function createElement(tag: string, attributes: { [key: string]: string }, content: string): string {
const attrs = Object.entries(attributes)
	.map(([key, value]) => `${key}="${value}"`)
	.join(" ");
return `<${tag} ${attrs}>${content}</${tag}>`;
}

// Component functions
function createTitle(text: string): string {
	return createElement("h1", { style: "color: #333;" }, text);
}

function createContent(text: string): string {
	return createElement("p", { style: "color: #666; font-size: 18px;" }, text);
}

function createFooter(text: string): string {
	return createElement("footer", { style: "margin-top: 20px; color: #999;" }, text);
}

export function createHomePage(): string {
	var header = createElement("h1", { style: "color: #333;" }, "Home page");
	var button = createElement("button", { onclick: "window.location.href='http://localhost:8080/about';"}, "about page");
	var div = createElement("div", { id: "app", style: "font-family: Arial, sans-serif; text-align: center; padding: 20px;" }, header + button);
	return div;
}

export function createAboutPage(): string {
	var header = createElement("h1", { style: "color: #333;" }, "About page");
	var button = createElement("button", { onclick: "window.location.href='http://localhost:8080/';"}, "back to home page");
	var div = createElement("div", { id: "app", style: "font-family: Arial, sans-serif; text-align: center; padding: 20px;" }, header + button);
	return div;
}
