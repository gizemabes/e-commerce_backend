var express = require('express');
const {query} = require("../config/db");
var router = express.Router();
const bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/', async (req, res, next) => {
    try {
      const sql = `
        SELECT products.name as productName, products.price,products.stock , orders.*, user.* 
        FROM orders 
        INNER JOIN products ON orders.product_id = products.id 
        INNER JOIN user ON orders.user_id = user.id 
      `;


      const orders = await query(sql);
   
      res.json(orders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching the orders' });
    }
  });

router.get('/:id', function(req, res, next) {
    query('SELECT * FROM orders WHERE id = ?', [req.params.id]).then(order => {
        res.json(order);
    }).catch(console.log)
});

router.post('/', async function(req, res, next) {


    try {
        // Sipariş verilen her bir ürün için
        for (let i = 0; i < req.body.cartItems.length; i++) {

            const { id,basket_id, user_id, status = 1, quantity } = req.body.cartItems[i];
            const product_id = id


            // Ürün stok miktarını kontrol et
            const [product] = await query('SELECT stock FROM products WHERE id = ?', [product_id]);

            if (product.stock < quantity) {
                // Stok yetersizse sepeti boşalt
                await query('DELETE FROM basket WHERE id = ?', [basket_id]);
                return res.status(400).json({ message: "Ürün stokta kalmamıştır." });
            }

            
            // Ürün stok miktarını azalt
            await query('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, product_id]);

            // Sipariş bilgilerini veritabanına ekle
            await query('INSERT INTO orders (basket_id, product_id, user_id, status, quantity) VALUES (?, ?, ?, ?, ?)',
                [basket_id, product_id, user_id, status, quantity]);

            // Sepeti boşalt
            await query('DELETE FROM basket WHERE user_id = ?', [user_id]);
        }

        res.json({ message: "Order placed successfully" });
    } catch (error) {
        console.error("Order error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



router.put('/:id', async function(req, res, next) {
    try {
        const result = await query('UPDATE orders SET status = 0 WHERE id = ?', [req.params.id]);
        res.json(result);
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});




module.exports = router;
