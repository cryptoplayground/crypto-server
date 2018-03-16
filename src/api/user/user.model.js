const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  passwordConf: {
    type: String,
    required: true,
  }
});

UserSchema.pre('save', (next) => {
  console.log('password:',this.password)
  bcrypt.hash(this.password, 10, (err, hash) => {
    if(err) { return next(err) }
    this.password = hash
    next()
  })
})

const User = mongoose.model('User', UserSchema);
module.exports = User;