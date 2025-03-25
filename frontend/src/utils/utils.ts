function deepCopyObj<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function createHtmlElementFromString(htmlString: string) {
  const template = document.createElement("template");
  template.innerHTML = htmlString;
  return template.content.firstElementChild as HTMLElement;
}

async function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

function navigateToSite(newRoute: string)
{
  history.pushState({}, "", newRoute);
  window.dispatchEvent(new Event("popstate"));
}

export { deepCopyObj, createHtmlElementFromString, convertToBase64, navigateToSite };
