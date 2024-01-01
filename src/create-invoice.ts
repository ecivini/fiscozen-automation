import { chromium } from "playwright";

export const createInvoice = async (
  customerName: string,
  invoiceDate: string,
  amount: number
): Promise<string> => {
    const fiscozenUrl = process.env.FISCOZEN_URL || "";
    const codiceAteco = process.env.FISCOZEN_CODICE_ATECO || "";
    const prestazione = process.env.FISCOZEN_PRESTAZIONE_MEMBERSHIP || "";
    const fiscozenUser = process.env.FISCOZEN_USER || "";
    const fiscozenPassword = process.env.FISCOZEN_PASSWORD || "";

    const browser = await chromium.launch();
    const context = await browser.newContext();
    context.setDefaultTimeout(5000);
try{
    const page = await context.newPage();

    await page.goto(fiscozenUrl);
    await page.screenshot({path:"login.png"});
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
    await page.screenshot({path:"logged.png"});
    await page.waitForTimeout(2000);

    await page.getByRole("link", { name: "Fatture" }).click();
    await page.waitForTimeout(2000);
    await page.getByRole("link", { name: " Nuova fattura " }).click();
    await page.waitForTimeout(2000);

    const lastName = customerName.split(" ").at(-1);
    const initName = customerName.slice(0, 5);
    await page
      .locator("#invoice_customer_id > div > div > div > input")

      .fill(lastName || initName);
    await page.waitForTimeout(2000);
    await page.getByText(customerName).click();
    await page.waitForTimeout(2000);

    await page.locator("#invoice_invoice_date").fill(invoiceDate);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(2000);

    await page.getByText(" Aggiungi prestazione ").click();
    await page.waitForTimeout(2000);
    await page.locator("#description").fill(prestazione);
    await page.locator("#amount").fill(amount.toString());
    await page.getByText(" Applica contributo GS INPS 4% ").click();
    await page.getByText(" Conferma ").click();

    await page.waitForTimeout(2000);

    await page.getByLabel("Scegli ATECO").selectOption(codiceAteco);
    await page.waitForTimeout(2000);
    await page.getByText(" Salva fattura ").click();
    await page.waitForTimeout(2000);

    await browser.close();
    return "success";
  } catch (e) {
    await browser.close();
    if (e instanceof Error) {
      return e.message;
    }
    return "Error while creating invoice";
  }
};
