var express = require('express');
const {query} = require("../config/db");
var router = express.Router();
const bcrypt = require('bcrypt');
const secret = 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcxMjI1MjIxMiwiaWF0IjoxNzEyMjUyMjEyfQ.51yTvrk2QFnRYOqlXOYARC9--KLto-HnEAJd_DsohUU'
const jwt = require('jsonwebtoken');

router.get('/', function(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Authorization token is missing' });
      }
      try{
        const decodedToken = jwt.verify(token, secret); 
        const userId = decodedToken.userId;
      query('SELECT user.id as user_id,products.name as product_name, products.id as product_id ,favorite_products.id as favorite_id, products.*, user.* FROM favorite_products INNER JOIN products ON favorite_products.product_id = products.id INNER JOIN user ON user.id = favorite_products.user_id WHERE user_id = ?', [userId]).then(favorites => {
          res.json(favorites);
      }).catch(console.log)
      }catch(e){
        console.log(e)
      }
  
    
});



router.post('/', function(req, res, next) {

    const {product_id, user_id} = req.body;


    query('INSERT INTO favorite_products (product_id, user_id) VALUES (?, ?)',
        [product_id, user_id]).then(favorites => {
        res.json(favorites);
    }).catch(console.log)
});



router.delete('/:id', function(req, res, next) {
    query('DELETE FROM favorite_products WHERE id = ?', [req.params.id]).then(favorites => {
        res.json(favorites);
    }).catch(console.log)
})

module.exports = router;
