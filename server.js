import express from "express";
import cors from "cors";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY;

// TEMP ORDER STORAGE
let pendingOrders = {};   // { linkId: { uid, items } }

// ------------------------------------------------------
// CREATE GCASH PAYMENT LINK (Correct Version)
// ------------------------------------------------------
app.post("/create-gcash", async (req, res) => {
  try {
    const { amount } = req.body;

    const finalAmount = amount * 100;

    const response = await axios.post(
      "https://api.paymongo.com/v1/links",
      {
        data: {
          attributes: {
            amount: finalAmount,
            description: "ShoeStride Order",
            remarks: "GCash Payment Test",
          }
        }
      },
      {
        headers: {
          Authorization:
            "Basic " + Buffer.from(PAYMONGO_SECRET + ":").toString("base64"),
          "Content-Type": "application/json",
        }
      }
    );

    res.json({
      success: true,
      paymongo_url: response.data.data.attributes.checkout_url
    });

  } catch (err) {
    console.error("PAYMONGO ERROR:", err.response?.data || err);
    res.status(500).json({
      success: false,
      message: "Error creating PayMongo Link"
    });
  }
});

// ------------------------------------------------------
// RETRIEVE ORDER AFTER PAYMENT
// ------------------------------------------------------
app.get("/get-pending-order/:linkId", (req, res) => {
  const { linkId } = req.params;

  if (!pendingOrders[linkId]) {
    return res.json({ success: false, message: "Order not found" });
  }

  res.json({
    success: true,
    ...pendingOrders[linkId]
  });

  delete pendingOrders[linkId];
});

// ------------------------------------------------------
// SERVER START
// ------------------------------------------------------
app.listen(5000, () => console.log("🔥 Backend running on port 5000"));
