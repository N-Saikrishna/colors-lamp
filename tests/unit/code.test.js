/**
 * @jest-environment jsdom
 */
const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "../../public/js/code.js"), "utf8");

let request;

class FakeXMLHttpRequest {
  constructor() {
    this.headers = {};
    request = this;
  }

  open(method, url) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(name, value) {
    this.headers[name] = value;
  }

  send(body) {
    this.body = JSON.parse(body);
  }

  respond(data) {
    this.readyState = 4;
    this.status = 200;
    this.responseText = JSON.stringify(data);
    this.onreadystatechange();
  }
}

// Runs code.js the way a page would, with a saved login for user 7.
function loadPage() {
  document.cookie = "firstName=Test,lastName=User,userId=7";
  window.eval(source);
  window.readCookie();
}

function text(id) {
  return document.getElementById(id).textContent;
}

beforeEach(() => {
  request = undefined;
  window.XMLHttpRequest = FakeXMLHttpRequest;
  document.body.innerHTML = `
    <input id="loginName"><input id="loginPassword"><span id="loginResult"></span>
    <input id="searchText"><span id="colorSearchResult"></span><p id="colorList"></p>
    <input id="colorText"><span id="colorAddResult"></span>`;
  loadPage();
});

describe("cookies", () => {
  test("a saved login is restored after a page reload", () => {
    window.saveCookie();
    window.eval(source);
    window.readCookie();
    window.saveCookie();

    expect(document.cookie).toBe("firstName=Test,lastName=User,userId=7");
  });
});

describe("doLogin", () => {
  beforeEach(() => {
    document.getElementById("loginName").value = "tester";
    document.getElementById("loginPassword").value = "secret";
    window.doLogin();
  });

  test("posts the form values as JSON", () => {
    expect(request.method).toBe("POST");
    expect(request.url).toMatch(/\/Login\.php$/);
    expect(request.headers["Content-type"]).toMatch("application/json");
    expect(request.body).toEqual({ login: "tester", password: "secret" });
  });

  test("shows a message when the login is rejected", () => {
    request.respond({ id: 0, firstName: "", lastName: "", error: "No Records Found" });

    expect(text("loginResult")).toBe("User/Password combination incorrect");
  });
});

describe("addColor", () => {
  beforeEach(() => {
    document.getElementById("colorText").value = "Teal";
    window.addColor();
  });

  test("posts the color with the logged-in user's id", () => {
    expect(request.method).toBe("POST");
    expect(request.url).toMatch(/\/AddColor\.php$/);
    expect(request.body).toEqual({ color: "Teal", userId: 7 });
  });

  test("confirms when the color is added", () => {
    request.respond({ error: "" });

    expect(text("colorAddResult")).toBe("Color has been added");
  });

  test("shows the error when the API reports one", () => {
    request.respond({ error: "Connection failed" });

    expect(text("colorAddResult")).toBe("Connection failed");
  });
});

describe("searchColor", () => {
  beforeEach(() => {
    document.getElementById("searchText").value = "bl";
    window.searchColor();
  });

  test("posts the search text with the logged-in user's id", () => {
    expect(request.method).toBe("POST");
    expect(request.url).toMatch(/\/SearchColors\.php$/);
    expect(request.body).toEqual({ search: "bl", userId: 7 });
  });

  test("lists one color per line", () => {
    request.respond({ results: ["Blue", "Black"], error: "" });

    expect(text("colorSearchResult")).toBe("Color(s) has been retrieved");
    expect(document.getElementById("colorList").innerHTML).toMatch(/^Blue<br>\s*Black$/);
  });

  test("clears old results and shows the error when nothing matches", () => {
    document.getElementById("colorList").textContent = "Old result";
    request.respond({ id: 0, firstName: "", lastName: "", error: "No Records Found" });

    expect(text("colorSearchResult")).toBe("No Records Found");
    expect(text("colorList")).toBe("");
  });
});
