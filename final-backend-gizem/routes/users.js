var express = require('express');
const {query} = require("../config/db");
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secret = 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcxMjI1MjIxMiwiaWF0IjoxNzEyMjUyMjEyfQ.51yTvrk2QFnRYOqlXOYARC9--KLto-HnEAJd_DsohUU'


/* GET users listing. */
router.get('/', function(req, res, next) {
  query('SELECT * FROM user').then(users => {
    res.json(users);
  }).catch(console.log)
});

router.get('/admin-account', function(req, res, next) {
  const token = req.headers.authorization;



  if (!token) {
    return res.status(401).json({ message: 'Authorization token is missing' });
  }

  try {
    const decodedToken = jwt.verify(token, secret); // Replace 'your_secret_key' with your actual secret key used to sign the token

    const userId = decodedToken.userId; // Assuming the token payload contains an 'id' field

    query('SELECT * FROM user WHERE id = ?', [userId]).then(user => {
      res.json(user);
    }).catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    });

  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
});

router.post('/', function(req, res, next) {

  const hashedPassword = bcrypt.hashSync(req?.body?.password, 10);

  query('INSERT INTO user (name,surname,email, password) VALUES (?, ?, ?, ?)',
        [req?.body?.name,req?.body?.surname, req?.body?.email, hashedPassword]).then(user => {
        res.json(user);
    }).catch(console.log)
});


router.put('/', async function(req, res, next) {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }

    const decodedToken = jwt.verify(token, secret); // Replace 'your_secret_key' with your actual secret key used to sign the token
    const userId = decodedToken.userId;

    const { name, email, current_password } = req.body;
  
    // Fetch the current user details from the database
    const user = await query('SELECT * FROM user WHERE id = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }



    if(current_password != '') {
   
 // Check current password if new password is provided
 if (!bcrypt.compareSync(current_password, user[0].password)) {
  return res.status(401).json({ message: 'Current password is incorrect' });
}

// Hash the new password if provided
let hashedPassword = null;
if (current_password) {
  hashedPassword = bcrypt.hashSync(current_password, 10);
}

// Fields to update
const fieldsToUpdate = [];
const values = [];

if (name) {
  fieldsToUpdate.push('name = ?');
  values.push(name);
}

if (email) {
  fieldsToUpdate.push('email = ?');
  values.push(email);
}
if (hashedPassword) {
  fieldsToUpdate.push('password = ?');
  values.push(hashedPassword);
}

// Update query
if (fieldsToUpdate.length > 0) {
  const sql = `UPDATE user SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
  values.push(userId);

  const result = await query(sql, values);
  res.json({ message: "User updated successfully", result });
} else {
  res.status(400).json({ message: "No fields to update" });
}
    }else {
   
    // Fields to update
    const fieldsToUpdate = [];
    const values = [];

    if (name) {
      fieldsToUpdate.push('name = ?');
      values.push(name);
    }

    if (email) {
      fieldsToUpdate.push('email = ?');
      values.push(email);
    }
 

    // Update query
    if (fieldsToUpdate.length > 0) {
      const sql = `UPDATE user SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
      values.push(userId);

      const result = await query(sql, values);
      res.json({ message: "User updated successfully", result });
    } else {
      res.status(400).json({ message: "No fields to update" });
    }
    }

    
   
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



module.exports = router;
