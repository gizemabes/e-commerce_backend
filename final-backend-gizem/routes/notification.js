const express = require('express');
const {query} = require("../config/db");
var router = express.Router();


//admin taraftan cagıralacak
router.get('/', function(req, res, next) {
    query('SELECT user.*, notification.* FROM notification INNER JOIN user ON notification.customer_id = user.id').then(products => {
        res.json(products);
    }).catch(console.log)
});

router.get('/:id', function(req, res, next) {
    query('SELECT * FROM notification WHERE id = ?', [req.params.id]).then(notification => {
        res.json(notification);
    }).catch(console.log)
});



//customer tarafında tetiklenecek
router.post('/', function(req, res, next) {

    const {message, customer_id, date} = req.body;

    

    query('INSERT INTO notification (message, customer_id, date) VALUES (?, ?, ?)',
        [message, customer_id, formatDate(date)]).then(notification => {
        res.json(notification);
    }).catch(console.log)
});

function formatDate (isoString) {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Aylar 0-11 arası olduğu için 1 ekliyoruz
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }

module.exports = router;



