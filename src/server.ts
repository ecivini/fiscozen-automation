import { createInvoice } from "./create-invoice";
const stripe = require("stripe")("sk_test_...");
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { formatDate } from "./utils";
import { sendMail } from "./sendMail";

dotenv.config();

const app = express();
const port = process.env.PORT;

const endpointSecret = process.env.STRIPE_SEC;

const fakeCustomer = "Fake Customer";

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request: Request, response: Response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err: unknown) {
      if (err instanceof Error) {
        response.status(400).send(`Webhook Error: ${err.message}`);
      }
      return;
    }

    // Handle the event
    switch (event.type) {
      case "invoice.payment_succeeded":
        const paymentInvoiceSucceeded = event.data.object;

        const amount = paymentInvoiceSucceeded.amount_paid / 100;
        const customerName =
          paymentInvoiceSucceeded.customer_name || fakeCustomer;
        const date = formatDate(paymentInvoiceSucceeded.created);

        createInvoice(customerName, date, amount).then(async (res) => {
          const options = {
            from: '"Giuseppe Funicello" <info@giuppi.dev>',
            to: "info@giuppi.dev",
          };
          if (res === "success") {
            const successOptions = {
              ...options,
              subject: `Creata una nuova fattura`,
              html: `<div><p>È stata creata una nuova fattura su Fiscozen.</p><p>Customer: ${customerName}</p><p>Cifra: ${amount}</p><p>data: ${date}</p></div>`,
            };
            await sendMail(successOptions);
          } else {
            const errorOpts = {
              ...options,
              subject: `Errore nella creazione di una nuova fattura`,
              html: `<div><p>Creazione in erore per una nuova fattura su Fiscozen.</p><p>Customer: ${customerName}</p><p>Cifra: ${amount}</p><p>data: ${date}</p><p>Error: ${res}</p></div>`,
            };
            await sendMail(errorOpts);
          }
        });

        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    response.send();
  }
);

app.listen(port, () => console.log(`Running on port ${port}`));
