import { chromium } from "playwright";

export const createCustomer = async (
  firstName: string,
  lastName: string,
  CAP: string,
  town: string,
  email: string,
  codiceFiscale: string,
  address: string
): Promise<string> => {
  const fiscozenUrl = process.env.FISCOZEN_URL || "";

  const fiscozenUser = process.env.FISCOZEN_USER || "";
  const fiscozenPassword = process.env.FISCOZEN_PASSWORD || "";

  const browser = await chromium.launch({
    headless: false,
  });
  const context = await browser.newContext();
  context.setDefaultTimeout(8000);
  try {
    const page = await context.newPage();

    await page.goto(fiscozenUrl);
    await page.waitForTimeout(2000);

    await page
      .getByRole("textbox", {
        name: "email",
      })
      .fill(fiscozenUser);
    await page
      .getByRole("textbox", {
        name: "password",
      })
      .fill(fiscozenPassword);

    await page.getByRole("button").click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: "logged.png" });
    await page.waitForTimeout(2000);

    await page.getByRole("link", { name: "Fatture" }).click();
    await page.waitForTimeout(2000);
    await page.getByRole("link", { name: " Lista clienti " }).click();
    await page.waitForTimeout(2000);
    await page.getByRole("button", { name: " Nuovo cliente " }).click();
    await page.waitForTimeout(2000);
    await page.getByText(" Società ").nth(1).click();
    await page.waitForTimeout(2000);
    await page.getByRole("option", { name: "Privato" }).click();

    await page.waitForTimeout(2000);
    await page.getByLabel("Codice fiscale").fill(codiceFiscale);
    await page.waitForTimeout(2000);
    await page.getByLabel("Nome", { exact: true }).fill(firstName);
    await page.waitForTimeout(2000);
    await page.getByLabel("Cognome").fill(lastName);
    await page.waitForTimeout(2000);
    await page.getByLabel("Indirizzo").fill(address);
    await page.waitForTimeout(2000);
    await page.getByLabel("CAP").fill(CAP);
    await page.waitForTimeout(2000);
    await page.getByText("Bruino").click();
    await page.waitForTimeout(2000);
    await page.getByText("Informazioni di contatto").click();
    await page.waitForTimeout(2000);
    await page.getByLabel("E-Mail").fill(email);
    await page.waitForTimeout(2000);
    await page.getByLabel("Codice destinatario").fill("0000000");
    await page.waitForTimeout(2000);

    await page.getByText(" Salva ").click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: "customer_created.png" });
    await page.waitForTimeout(2000);

    await browser.close();
    return "success";
  } catch (e) {
    console.log("ERROR", e);
    await browser.close();
    if (e instanceof Error) {
      return e.message;
    }
    return "Error while creating customer";
  }
};
