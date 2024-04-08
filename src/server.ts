import { createInvoice } from "./create-invoice";
const stripe = require("stripe")("sk_test_...");
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { formatDate } from "./utils";
import { sendMail } from "./sendMail";
import { createCustomer } from "./create-customer";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT;

const endpointSecret = process.env.STRIPE_SEC;

const fakeCustomer = "Fake Customer";

app.get("/test", (req, res) => {
  res.send({ message: "It works!" });
});

app.get("/create-invoice-test", (request: Request, response: Response) => {
  const amount = 25;
  const customerName = fakeCustomer;
  const date = formatDate(1711424611);

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

  response.send();
});

app.post(
  "/create-invoice",
  express.raw({ type: "application/json" }),
  (request: Request, response: Response) => {
    const amount = request.body.amount_paid / 100;
    const customerName = request.body.customer_name || fakeCustomer;
    const date = formatDate(request.body.created);

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

    response.send();
  }
);

app.post(
  "/create-customer",
  express.raw({ type: "application/json" }),
  (request: Request, response: Response) => {
    const firstName = request.body.firstName;
    const lastName = request.body.lastName;
    const cap = request.body.cap;
    const town = request.body.town;
    const email = request.body.email;
    const codiceFiscale = request.body.codiceFiscale;
    const address = request.body.address;

    createCustomer(
      firstName,
      lastName,
      cap,
      town,
      email,
      codiceFiscale,
      address
    ).then(async (res) => {
      const options = {
        from: '"Giuseppe Funicello" <info@giuppi.dev>',
        to: "info@giuppi.dev",
      };
      if (res === "success") {
        const successOptions = {
          ...options,
          subject: `Creata una nuova fattura`,
          html: `<div><p>È stata creato un nuovo cliente su Fiscozen.</p><p>Customer: ${firstName} ${lastName}</p><p>Email: ${email}</p></div>`,
        };
        await sendMail(successOptions);
      } else {
        const errorOpts = {
          ...options,
          subject: `Errore nella creazione di una nuova fattura`,
          html: `<div><p>Creazione in erore per un nuovo cliente su Fiscozen.</p><p>Customer: ${firstName} ${lastName}</p><p>Email: ${email}</p></div>`,
        };
        await sendMail(errorOpts);
      }
    });

    response.send();
  }
);

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
