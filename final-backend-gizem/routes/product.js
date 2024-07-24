var express = require('express');
const {query} = require("../config/db");
var router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage });


router.get('/', function(req, res, next) {
    query('SELECT * FROM products').then(products => {
        res.json(products);
    }).catch(console.log)
});

router.get('/:id', function(req, res, next) {
    query('SELECT * FROM products WHERE id = ?', [req.params.id]).then(product => {
        res.json(product);
    }).catch(console.log)
});

router.post('/', upload.single('file'), function (req, res, next) {
    const { name, price, stock } = req.body;
    const file_path = req.file ? `/images/${req.file.filename}` : null;
  
    query('INSERT INTO products (name, price, stock, file_path) VALUES (?, ?, ?, ?)',
      [name, price, stock, file_path])
      .then(product => {
        res.json(product);
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while adding the product' });
      });
  });


router.put('/:id', function(req, res, next) {
    const {name, price, stock} = req.body;

 
    query('UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?',
        [name, price, stock ,req.params.id]).then(product => {
        res.json(product);
    }).catch(console.log)
})

router.delete('/:id', function (req, res, next) {
    // Öncelikle ürünün dosya yolunu veritabanından al
    query('SELECT file_path FROM products WHERE id = ?', [req.params.id])
      .then(results => {
        if (results.length > 0) {
          const filePath = path.join(__dirname, '../public', results[0].file_path);
        
  
          // Veritabanından ürünü sil
          query('DELETE FROM products WHERE id = ?', [req.params.id])
            .then(() => {
              // Dosyayı sistemden sil
              fs.unlink(filePath, err => {
                if (err) {
                  console.error('Error deleting file:', err);
                  return res.status(500).json({ error: 'An error occurred while deleting the file' });
                }
                res.json({ message: 'Product and file deleted successfully' });
              });
            })
            .catch(error => {
              console.error(error);
              res.status(500).json({ error: 'An error occurred while deleting the product' });
            });
        } else {
          res.status(404).json({ error: 'Product not found' });
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while retrieving the product' });
      });
  });
module.exports = router;
