// Runs against the real PHP API and a MySQL database loaded from setup.sql.
const apiUrl = process.env.API_URL || "http://127.0.0.1:8080";

async function post(endpoint, body) {
  const response = await fetch(`${apiUrl}/${endpoint}.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await response.text();

  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toMatch("application/json");
  return JSON.parse(text);
}

describe("Login.php", () => {
  test("returns the user for a correct login", async () => {
    expect(await post("Login", { login: "tester", password: "secret" })).toEqual({
      id: 1,
      firstName: "Test",
      lastName: "User",
      error: "",
    });
  });

  test("returns an error for a wrong password", async () => {
    expect(await post("Login", { login: "tester", password: "wrong" })).toEqual({
      id: 0,
      firstName: "",
      lastName: "",
      error: "No Records Found",
    });
  });
});

describe("SearchColors.php", () => {
  test("returns the colors that match", async () => {
    const data = await post("SearchColors", { search: "bl", userId: 1 });

    expect(data.error).toBe("");
    expect([...data.results].sort()).toEqual(["Black", "Blue"]);
  });

  test("does not return another user's colors", async () => {
    const data = await post("SearchColors", { search: "", userId: 2 });

    expect(data).toEqual({ results: ["Crimson"], error: "" });
  });

  test("returns an error when nothing matches", async () => {
    const data = await post("SearchColors", { search: "no such color", userId: 1 });

    expect(data.error).toBe("No Records Found");
  });
});

describe("AddColor.php", () => {
  test("saves a color that can then be found", async () => {
    const color = `Teal ${Date.now()}`;

    expect(await post("AddColor", { color, userId: 1 })).toEqual({ error: "" });
    expect(await post("SearchColors", { search: color, userId: 1 })).toEqual({
      results: [color],
      error: "",
    });
  });
});
