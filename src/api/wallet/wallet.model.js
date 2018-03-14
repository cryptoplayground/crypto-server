const mongoose = require('mongoose')
const Schema = mongoose.Schema

const walletSchema = new Schema({
  owner: String,
  holdings: [{
    coin: String,
    balance: Number
  }]
})

const Wallet = mongoose.model('Wallet', walletSchema)

module.exports = Wallet