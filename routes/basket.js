var express = require('express');
const {query} = require("../config/db");
var router = express.Router();


router.get('/', function(req, res, next) {
    query('SELECT basket.*, products.* FROM basket INNER JOIN products ON products.id = basket.product_id').then(data => {
        res.json(data);
    }).catch(console.log)
});


router.get('/a', async function(req, res, next) {
    try {
      
        
        const userId = req.query.id; // Query parametresinden user id'yi alıyoruz

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const cartItems = await query('SELECT basket.user_id as user_id, basket.quantity as quantity, basket.id as basket_id, products.* FROM basket INNER JOIN products ON products.id = basket.product_id WHERE user_id = ?', [userId]);

        if (cartItems.length === 0) {
            return res.status(400).json({ message: "No items found in the cart for this user" });
        }

        res.json(cartItems);
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
//sepete ekleme
router.post('/', async function(req, res, next) {
    
  
    const {id,product_id, quantity, user_id} = req.body;
    const productId = product_id
    const userId = user_id

    try {

        await query('INSERT INTO basket (product_id, quantity, user_id) VALUES (?, ?, ?)',
            [productId, quantity, userId]);

        res.json({ message: "Order placed successfully" });
    } catch (error) {
        console.error("Order error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.put('/:id', async function(req, res, next) {
    try {
        const result = await query('UPDATE basket SET quantity = ? WHERE id = ?', [req.body.quantity, req.params.id]);
        res.json(result);
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.delete('/:id', async function(req, res, next) {
    try {
        const result = await query('DELETE FROM basket WHERE id = ?', [req.params.id]);
        res.json(result);
    } catch (error) {
        console.error("Error deleting basket item:", error);
        res.status(500).json({ message: "Internal server error" });
    }

})

module.exports = router;
