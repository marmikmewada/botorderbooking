const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let orders = [];

// Load existing orders from orders.json
fs.readFile('orders.json', (err, data) => {
    if (!err) {
        orders = JSON.parse(data);
    }
});

// Function to save orders
const saveOrders = () => {
    fs.writeFile('orders.json', JSON.stringify(orders, null, 2), (err) => {
        if (err) console.error('Error saving orders:', err);
    });
};

// Endpoint for chatbot interaction
app.post('/chat', (req, res) => {
    const userMessage = req.body.message.toLowerCase();
    let response = '';

    // Handle user messages
    if (userMessage.includes('menu')) {
        response = "Here’s our menu: 1. Chicken Bucket 2. Fries 3. Cola. What would you like to order?";
    } else if (userMessage.includes('order')) {
        // Capture the order
        const items = userMessage.match(/(chicken bucket|fries|cola)/g);
        if (items) {
            response = `You ordered: ${items.join(', ')}. Please provide your address.`;
            orders.push({ items, address: '' }); // Add empty address for now
        } else {
            response = "I didn't catch that. Please specify your order.";
        }
    } else if (userMessage.includes('address')) {
        // Capture the address
        const address = userMessage.replace('address', '').trim();
        if (orders.length > 0) {
            orders[orders.length - 1].address = address; // Store the address in the latest order
            saveOrders();
            response = `Your order has been placed! We will deliver it to: ${address}.`;
        } else {
            response = "Please place an order first.";
        }
    } else {
        response = "I'm not sure how to help with that. You can ask for the menu or place an order.";
    }

    res.json({ response });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
