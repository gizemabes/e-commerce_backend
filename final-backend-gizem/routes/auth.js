const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require("../config/db");
var Cookies = require('cookies')
const secret = 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcxMjI1MjIxMiwiaWF0IjoxNzEyMjUyMjEyfQ.51yTvrk2QFnRYOqlXOYARC9--KLto-HnEAJd_DsohUU'

// Kullanıcı kaydı (register) endpoint'i
router.post('/register', async function(req, res, next) {
    try {
        // Veritabanında bu e-posta adresine sahip bir kullanıcı var mı kontrol ediyoruz
        const existUser = await query('SELECT * FROM user WHERE email = ?', [req.body.email])

 
    
        if (existUser.length === 0) {
            const hashedPassword = bcrypt.hashSync(req.body.password, 10);
            const result = await query('INSERT INTO user (name, surname, email, password, role) VALUES (?, ?, ?, ?, ?)', [req.body.name, req.body.surname, req.body.email, hashedPassword, 0]);
            res.json(result);
        } else {
            // Kullanıcı zaten kayıtlıysa, hata mesajı gönderiyoruz
            res.status(400).json({
                message: 'Already User Registered'
            });
        }

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Kullanıcı girişi (login) endpoint'i
router.post('/login', async function(req, res, next) {
  
    try {
        const user = await query('SELECT * FROM user WHERE email = ?', [req.body.email]);

        if (user.length === 0) {
            res.status(401).json({ message: "User not found" });
        } else {
            if (bcrypt.compareSync(req.body.password, user[0].password)) {
                // Kullanıcı kimliği doğrulandı, JWT oluşturulacak
                const token = jwt.sign({
                    userId: user[0].id
                }, secret, { expiresIn: '1h' });

                const cookies = new Cookies(req, res);
                cookies.set('token', token, {
                    httpOnly: true,
                    maxAge: 60 * 60 * 1000 // 1 saat
                });

                
                res.json({ user, token });
            } else {
                res.status(401).json({ message: "Wrong password" });
            }
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Kullanıcı girişi (login) endpoint'i
router.post('/admin/login', async function(req, res, next) {
    try {
        const user = await query('SELECT * FROM user WHERE email = ?', [req.body.email]);

        if (user.length === 0) {
            res.status(404).json({ message: "User not found" });
        } else {
            if (bcrypt.compareSync(req.body.password, user[0].password)) {
                // Kullanıcı kimliği doğrulandı, JWT oluşturulacak
                const token = jwt.sign({
                    userId: user[0].id
                }, secret, { expiresIn: '1h' });

                const cookies = new Cookies(req, res);
                cookies.set('token', token, {
                    httpOnly: true,
                    maxAge: 60 * 60 * 1000 // 1 saat
                });


                res.json({ user, token });
            } else {
                res.status(400).json({ message: "Wrong password" });
            
            }
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Kullanıcı kaydı (register) endpoint'i
router.post('/admin/register', async function(req, res, next) {
    try {
        // Veritabanında bu e-posta adresine sahip bir kullanıcı var mı kontrol ediyoruz
        const existUser = await query('SELECT * FROM user WHERE email = ?', [req.body.email])

 
    
        if (existUser.length === 0) {
            const hashedPassword = bcrypt.hashSync(req.body.password, 10);
            const result = await query('INSERT INTO user (name, surname, email, password, role) VALUES (?, ?, ?, ?, ?)', [req.body.name, req.body.surname, req.body.email, hashedPassword, 1]);
            res.json(result);
        } else {
            // Kullanıcı zaten kayıtlıysa, hata mesajı gönderiyoruz
            res.status(400).json({
                message: 'Already User Registered'
            });
        }

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.get('/admin/logout', async function(req, res, next) {
    try {
        const cookies = new Cookies(req, res);
        cookies.set('token', null, {
            httpOnly: true,
            expires: new Date(0),
           
        });
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



module.exports = router;
