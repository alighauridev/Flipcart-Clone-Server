const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const errorMiddleware = require("./middlewares/error");
const cors = require("./utils/cors.js");
const coinbase = require("coinbase-commerce-node");

const app = express();

// config
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: "backend/config/config.env" });
}

// Initialize Coinbase Client
const { Client, resources } = coinbase;
const clientObj = Client.init("63bd19a0-4244-44a5-98eb-0aa4e79ed453");

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cors.corsAll);

// Import route modules
const user = require("./routes/userRoute");
const product = require("./routes/productRoute");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute"); // Import paymentRoute

// Define routes
app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("/api/v1", order);
app.use("/api/v1", payment); // Use paymentRoute

app.post("/api/v1/create-payment", async (req, res) => {
    try {
        const { amount, currency, email, phoneNo, billing_details, user, orderId } = req.body;

        const charge = await resources.Charge.create({
            name: "Sample Payment",
            description: "Sample payment description",
            pricing_type: "fixed_price",
            local_price: {
                amount,
                currency,
            },

            metadata: {
                user_id: user,
                orderId,
                email,
                phoneNo,
                billing_details,
            },
        });


        res.json(charge);
        // console.log(charge);
    } catch (error) {
        console.error("Error creating payment:", error);
        res.status(500).json({ error: "An error occurred" });
    }
});
app.post('/webhook', async (req, res) => {
    const rawBody = req.body.toString(); // Convert the raw buffer to a string
    const signature = req.header('X-CC-Webhook-Signature');

    try {
        const event = Webhook.verifyEventBody(rawBody, signature, '7ed57dc4-b30d-472f-8401-d65425aea2d4');

        // Handle different types of events
        switch (event.type) {
            case 'charge:confirmed':
                console.log('Charge Confirmed:', event.data);
                const orderId = event.data.metadata.orderId;

                // Assuming you have a function to update the order status based on orderId
                await updateOrderStatus(orderId, 'confirmed'); // 'updateOrderStatus' is a placeholder

                break;
            case 'charge:failed':
                console.log('Charge Failed:', event.data);
                // Handle failed charge event
                break;
            // Add more cases for other event types as needed

            default:
                console.log('Unhandled Event:', event.type);
        }

        res.status(200).json({ message: 'Webhook received successfully' });
    } catch (error) {
        console.error('Webhook Error:', error.message);
        res.status(400).json({ error: 'Webhook verification failed' });
    }
});

// Deployment
__dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/build")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
    });
} else {
    app.get("/", (req, res) => {
        res.send("Server is Running! 🚀");
    });
}

// Error middleware
app.use(errorMiddleware);

module.exports = app;
