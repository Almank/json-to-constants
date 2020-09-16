import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const convertJSON = vscode.commands.registerCommand(
    "json-to-constants.json-to-const",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const selection = editor.selection;
      const text = editor.document.getText(selection);
      const jsonObject = JSON.parse(text);
      const newText = createNewText(jsonObject);
      replaceAllTextWithConstants(newText, editor);
    }
  );

  context.subscriptions.push(convertJSON);
}

const getTypeOfElement = (element: any) => {
  return typeof element;
};

const getFormattingForType = (element: any): any => {
  const type = getTypeOfElement(element);
  if (type === "string") {
    return `"${element}"`;
  }
  return element;
};

const getPropertiesFromObjectArray = (object: any) => {
  return Object.keys(object).map((property) =>
    makeObject(object[property as any])
  );
};

const getArrayToString = (array: string[]) => {
  return `[${array.join(", ")}]`;
};

const replaceString = (string: string) => {
  return `"${string.replace(/\n/g, "\\n").replace(/\"/g, '\\"')}"`;
};

const createStringOfObject = (object: any) => {
  return Object.keys(object).map(
    (property) => ` ${property}: ${makeObject(object[property])}`
  );
};

const getObjectToString = (stringArray: string[]) => {
  return `{${stringArray.join(", ")}}`;
};

const makeObject = (object: any): string => {
  switch (typeof object) {
    case "undefined":
      return "undefined";
    case "string":
      return replaceString(object);
    case "object":
      if (!object) {
        return "null";
      }
      if (object instanceof Array) {
        const array = getPropertiesFromObjectArray(object);
        return getArrayToString(array);
      }
      const objectString = createStringOfObject(object);
      return getObjectToString(objectString);
    default:
      return object.toString();
  }
};

const createNewText = (jsonObject: any) => {
  const keys = Object.keys(jsonObject);

  return keys.map((key) => {
    const type = getTypeOfElement(jsonObject[key]);

    if (!["string", "number", "boolean", "null"].includes(type.toString())) {
      return `const ${key.toUpperCase()} = ${makeObject(jsonObject[key])};\n`;
    }
    return `const ${key.toUpperCase()} = ${getFormattingForType(
      jsonObject[key]
    )};\n`;
  });
};

const replaceAllTextWithConstants = (text: string[], editor: any) => {
  const firstLine = editor.document.lineAt(0);
  const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
  const textRange = new vscode.Range(
    0,
    firstLine.range.start.character,
    editor.document.lineCount - 1,
    lastLine.range.end.character
  );

  editor.edit(function (editBuilder: any) {
    editBuilder.replace(textRange, text.join(""));
  });
};

export function deactivate() {}
