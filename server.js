require("dotenv").config();
const express = require("express");
const cors = require("cors");
// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to eShop website")
})

const array = []
const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
    items.forEach(item => {
        const { price, cartQuantity } = item

        // Calculate total worth per item and push it into array
        const cartItemAmount = cartQuantity * price
        array.push(cartItemAmount)
    })

    // Calculate the worth of all the items in the array
    const totalAmount = array.reduce((accumulator, item) => (accumulator += item), 0)
    
    // * 100 to get the price in dollars
    return totalAmount * 100
};

app.post("/create-payment-intent", async (req, res) => {
  const { items, shipping, description, userEmail } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    description,
    shipping: {
        address: {
            line1: shipping.line1,
            line2: shipping.line2,
            city: shipping.city,
            country: shipping.country,
            postal_code: shipping.postal_code,
        },
        name: shipping.name,
        phone: shipping.phone
    },
    // receipt_email: userEmail
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});


const PORT = process.env.PORT || 4242
app.listen(PORT, () => console.log(`Node server listening on port ${PORT}`));