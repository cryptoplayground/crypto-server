const express = require('express')
const router = express.Router()

const walletRouter = require('./wallet.router')
const poloniexController = require('../controllers/crypto/poloniex.controller')
const walletController = require('../controllers/wallet/wallet.controller')

const app = express()

app.use('/api/wallets', walletRouter)

router.route('/transaction-log')
  .get((req, res) => {
    res.send('Transaction Log')
  })

router.route('/currencies')
  .get((req, res) => {
    handleController(poloniexController.getCurrencies(), res)
  })

router.route('/crypto')
  .get((req, res) => {
    handleController(poloniexController.getCombined('USDT'), res)
  })


function handleController(controllerPromise, res) {
  controllerPromise
    .then(data => {
      res.send(data)
    })
    .catch(reason => {
      console.error(reason)
      res.status(500).send(reason)
    })
}

module.exports = router