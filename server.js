require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("node:crypto");

const app = express();
const PORT = process.env.PORT || 5000;

// constants

const ABA_PAYWAY_API_URL = process.env.ABA_PAYWAY_API_URL;
const ABA_PAYWAY_API_KEY = process.env.ABA_PAYWAY_API_KEY;
const ABA_PAYWAY_MERCHANT_ID = process.env.ABA_PAYWAY_MERCHANT_ID;

// middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// generate HMAC hash

function generateHash(data, publicKey) {
  const hmac = crypto.createHmac("sha512", publicKey);
  hmac.update(data);
  const hash = hmac.digest("base64");
  return hash;
}

// handle checkout form submission
app.post("/checkout", (req, res) => {
  const items = Buffer.from(
    JSON.stringify([
      { name: "item1", quantity: "1", price: "5.00" },
      { name: "item2", quantity: "1", price: "5.00" },
    ])
  ).toString("base64");

  const req_time = Math.floor(Date.now() / 1000);
  const tran_id = req_time;
  const merchant_id = ABA_PAYWAY_MERCHANT_ID;
  const amount = "11.00";
  const firstName = "Arun";
  const lastName = "Suosdey";
  const phone = "012345678";
  const email = "develop@ababankapi.com";
  const return_params = "Hello paranoidy0cod3";
  const type = "purchase";
  const currency = "USD";
  const payment_option = "abapay";
  const shipping = "1.50";

  const dataToHash = `${req_time}${merchant_id}${tran_id}${amount}${items}${shipping}${firstName}${lastName}${email}${phone}${type}${payment_option}${currency}${return_params}`;
  const hash = generateHash(dataToHash, ABA_PAYWAY_API_KEY);
  res.send(
    `
    <form method="POST" action="${ABA_PAYWAY_API_URL}" id="aba_merchant_request">
    <input type="hidden" name="req_time" value="${req_time}" />
    <input type="hidden" name="merchant_id" value="${ABA_PAYWAY_MERCHANT_ID}" />
    <input type="hidden" name="tran_id" value="${tran_id}" />
    <input type="hidden" name="firstname" value="${firstName}" />
    <input type="hidden" name="lastname" value="${lastName}" />
    <input type="hidden" name="email" value="${email}" />
    <input type="hidden" name="phone" value="${phone}" />
    <input type="hidden" name="amount" value="${amount}" />
    <input type="hidden" name="type" value="${type}" />
    <input type="hidden" name="payment_option" value="${payment_option}" />
    <input type="hidden" name="items" value="${items}" />
    <input type="hidden" name="currency" value="${currency}" />
    <input type="hidden" name="shipping" value="${shipping}" />
    <input type="hidden" name="return_param" value="${return_params}" />    
    <input type="hidden" name="hash" value="${hash}" />
    </form>
    <script>
    document.getElementById('aba_merchant_request').submit();
    </script>`
  );
});

app.listen(PORT, () => console.log(`server is up on port: ${PORT}`));
