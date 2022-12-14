const router = require('express').Router()
const bcrypt = require('bcrypt')
const session = require('express-session')
const db = require('../db')
const checkAuth = require('../middleware/auth')

// router
//   .route('/cart')
//   .post(checkAuth, async (req, res) => {
//     const {quantity} = req.body
//     const {inventoryId} = req.query
//     const [[item]] = await db.query(
//       `SELECT * FROM inventory WHERE id=?`,
//       [inventoryId]
//     )
//     if (!item) return res.status(404).send('Item not found')
//     if (quantity > item.quantity)
//       return res.status(409).send('Not enough inventory')

//     const [[cartItem]] = await db.query(
//       `SELECT
//         inventory.id,
//         name,
//         price,
//         inventory.quantity AS inventoryQuantity,
//         cart.id AS cartId,
//         cart.user_id
//       FROM inventory
//       LEFT JOIN cart on cart.inventory_id=inventory.id
//       WHERE inventory.id=? AND cart.user_id=?;`,
//       [inventoryId, req.session.userId]
//     )
//     if (cartItem) {
//       await db.query(
//         `UPDATE cart SET quantity=quantity+? WHERE inventory_id=? AND user_id=?`,
//         [quantity, inventoryId, req.session.userId]
//       )
//     } else {
//       await db.query(
//         `INSERT INTO cart(inventory_id, quantity, user_id) VALUES (?,?,?)`,
//         [inventoryId, quantity, req.session.userId]
//       )
//     }
//     res.redirect('/cart')
//   })
//   .delete(checkAuth, async (req, res) => {
//     await db.query('DELETE FROM cart WHERE user_id=?', [req.session.userId])
//     res.redirect('/cart')
//   })

// router
//   .route('/cart/:cartId')
//   .put(checkAuth, async (req, res) => {
//     const {quantity} = req.body
//     const [[cartItem]] = await db.query(
//       `SELECT
//         inventory.quantity as inventoryQuantity
//         FROM cart
//         LEFT JOIN inventory on cart.inventory_id=inventory.id
//         WHERE cart.id=? AND cart.user_id=?`,
//         [req.params.cartId, req.session.userId]
//     )
//     if (!cartItem)
//       return res.status(404).send('Not found')
//     const {inventoryQuantity} = cartItem
//     if (quantity > inventoryQuantity)
//       return res.status(409).send('Not enough inventory')
//     if (quantity > 0) {
//       await db.query(
//         `UPDATE cart SET quantity=? WHERE id=? AND user_id=?`
//         ,[quantity, req.params.cartId, req.session.userId]
//       )
//     } else {
//       await db.query(
//         `DELETE FROM cart WHERE id=? AND user_id=?`,
//         [req.params.cartId, req.session.userId]
//       )
//     }
//     res.status(204).end()
//   })
//   .delete(checkAuth, async (req, res) => {
//     const [{affectedRows}] = await db.query(
//       `DELETE FROM cart WHERE id=? AND user_id=?`,
//       [req.params.cartId, req.session.userId]
//     )
//     if (affectedRows === 1)
//       res.status(204).end()
//     else
//       res.status(404).send('Cart item not found')
//   })

router.post('/user', async (req, res) => {
  try {
    const {username, password, birthday} = req.body
    if (!(username && password && birthday)) return res.status(400).send('missing username, password or dob')
    const hash = await bcrypt.hash(password, 10)
    const dbhash = await bcrypt.hash(birthday, 10)
    await db.query(
      `INSERT INTO users (username, password, birthday) VALUES (?, ?, ?)`,
      [username, hash, dbhash]
      )
    res.redirect('/login')
  } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') 
        return res.status(409).send('the user exists already')
      res.status(500).send('Error creating user: ' + err.message || err.sqlMessage)
    }
})

router.post('/login', async (req, res) => {
  try { 
  const {username, password} = req.body
  if (!(username && password)) return res.status(400).send('missing username or password')

  const [[user]] = await db.query(
    `SELECT * FROM users WHERE username=?`,
    [username]
  )
  if (!user) return res.status(400).send('user not found')
  
  const isCorrectPassword = await bcrypt.compare(password, user.password)
  if (!isCorrectPassword) return res.status(400).send('incorrect login')
  req.session.loggedIn = true
  req.session.userId = user.id
  req.session.save(() => res.redirect('/search'))
} catch(err) {
    res.status(500).send('Error logging in: ' + err.message || err.sqlMessage)
}})

router.get('/logout', async (req, res) => {
  req.session.destroy(() => res.redirect('/'))
})

router.get('/isLoggedIn', (req, res) => {
  try {
    if (req.session.loggedIn) {
      return res.status(200).json({data: "Is loggedIn!"})
    }
    return res.status(400).json({error: "user not Found"})
  }
  catch (error) {
    res.status(400).json({error})
  }
})

router.post('/updatePassword', async (req, res) => {
  try {
    const {username, password, newPassword} = req.body
    if (!(username && password, newPassword)) return res.status(400).send('missing username, current password, and new password')
    const [[user]] = await db.query(
      `SELECT * FROM users WHERE username=?`,
      [username]
    )
    if (!user) return res.status(400).send('user not found')
  
  const isCorrectPassword = await bcrypt.compare(password, user.password)
  if (!isCorrectPassword) return res.status(400).send('current password incorrect')
  
    const newhash = await bcrypt.hash(newPassword, 10)
    await db.query(
      `UPDATE users SET password = ? WHERE username = ?`,
      [newhash, username]
      )
    res.redirect('/account')
  } catch (err) {
      res.status(500).send('Error updating user: ' + err.message || err.sqlMessage)
    }
})

router.post('/deleteAccount', async (req, res) => {
  try {
    const {username, password} = req.body
    if (!(username && password)) return res.status(400).send('missing username, and password')
    const [[user]] = await db.query(
      `SELECT * FROM users WHERE username=?`,
      [username]
    )
    if (!user) return res.status(400).send('user not found')
  
  const isCorrectPassword = await bcrypt.compare(password, user.password)
  if (!isCorrectPassword) return res.status(400).send('password incorrect')
  
    await db.query(
      `DELETE FROM users WHERE username=?`,
      [username]
      )
      req.session.destroy(() => res.redirect('/users'))
  } catch (err) {
      res.status(500).send('Error deleting user: ' + err.message || err.sqlMessage)
    }
})


module.exports = router
