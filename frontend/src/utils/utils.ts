function deepCopyObj(obj: object) {
  return JSON.parse(JSON.stringify(obj));
}

function generateUniqueId(): string {
  return "id-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
}

function createHtmlElementFromString(htmlString: string) {
  const template = document.createElement("template");
  template.innerHTML = htmlString;
  return template.content.firstElementChild as HTMLElement;
}

export { deepCopyObj, generateUniqueId, createHtmlElementFromString };
