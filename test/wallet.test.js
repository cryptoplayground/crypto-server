process.env.NODE_ENV = 'test'

let mongoose = require('mongoose')
let Mockgoose = require('mockgoose').Mockgoose
let mockgoose = new Mockgoose(mongoose)

let app = require('../app')
let Promise = require('bluebird');
let walletController = require('../src/api/wallet/wallet.controller')
let Wallet = require('../src/api/wallet/wallet.model')

let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()

chai.use(chaiHttp)

before( done => {
  done()
})

describe('Wallets', () => {
  beforeEach( done => {
    Wallet.remove({}, err => { done() })
  })

  afterEach(done => {
    Wallet.remove({}, err => { done() })
  })

  describe('/GET all wallets', () => {
    it('gets empty array by default', done => {
      chai.request(app)
        .get('/api/wallets')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.equal(0)
          done()
        })
    })

    it('gets all wallets', done => {
      let wallet1 = new Wallet()
      let wallet1promise = wallet1.save()
      let wallet2 = new Wallet()
      let wallet2promise = wallet2.save()

      Promise.all([wallet1promise, wallet2promise])
        .then((values) => {
          chai.request(app)
            .get('/api/wallets')
            .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.a('array')
              res.body.should.have.length(2)
              done()
            })
        })
    })
  })

  describe('/GET wallet by name', () => {
    it('returns the correct wallet', async () => {
      let wallet = {
        owner: 'mduguay',
        holdings: [{ coin: 'BTC', balance: 64}]
      }

      let wallet2 = {
        owner: 'tnorling',
      }

      await walletController.create(wallet)
      await walletController.create(wallet2)

      let c = chai.request(app)
        .get('/api/wallets?owner=mduguay')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.owner.should.equal('mduguay')
          res.body.holdings[0].balance.should.equal(64)
        })
    })
  })

  describe('/POST a wallet', () => {
    it('adds a new wallet', done => {
      let wallet = {
        owner: 'John Doe',
        holdings: [{ coin: 'BTC', balance: 64}]
      }
      chai.request(app)
        .post('/api/wallets')
        .send(wallet)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('_id')
          res.body.owner.should.equal(wallet.owner)
          res.body.holdings[0].balance.should.equal(wallet.holdings[0].balance)
          done()
        })
    })

    it('ignores the _id field', done => {
      let wallet = {
        _id: '',
        owner: 'Mark Smith',
        holdings: [{ coin: 'BTC', balance: 64}]
      }
      chai.request(app)
      .post('/api/wallets')
      .send(wallet)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('_id')
        res.body.owner.should.equal(wallet.owner)
        res.body.holdings[0].balance.should.equal(wallet.holdings[0].balance)
        done()
      })
    })
  })

  describe('/DELETE all wallets', () => {
    it('removes all wallets', done => {
      let wallet1 = new Wallet()
      let wallet1promise = wallet1.save()
      let wallet2 = new Wallet()
      let wallet2promise = wallet2.save()

      Promise.all([wallet1promise, wallet2promise])
        .then((values) => {
          chai.request(app)
            .delete('/api/wallets')
            .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.ok.should.be.equal(1)
              chai.request(app)
                .get('/api/wallets')
                .end((err, res) => {
                  res.should.have.status(200)
                  res.body.should.be.a('array')
                  res.body.length.should.be.eql(0)
                  done()
                })
            })
        })
    })
  })

  describe('/GET one wallet', () => {
    it('returns one wallet by id', done => {
      let wallet = new Wallet()
      wallet.save((err, wallet) => {
        chai.request(app)
          .get('/api/wallets/' + wallet._id)
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')            
            res.body.should.have.property('_id').equals(wallet._id.toString())
          done()
          })
      })
    })

    it('returns error on incorrect id', done => {
      chai.request(app)
        .get('/api/wallets/' + 'incorrectid')
        .end((err, res) => {
          res.should.have.status(500)
          done()
        })
    })
  })

  describe('/PUT an update', () => {
    it('modifies the selected wallet', done => {
      let oldWallet = new Wallet({
        holdings: [{ name: 'BTC', balance:0 }]
      })
      oldWallet.save((err, wallet) => {
        let updatedWallet = new Wallet({
          _id: wallet._id,
          holdings: [{ name: 'BTC', balance: 64}]
        })
        chai.request(app)
          .put('/api/wallets/' + updatedWallet._id)
          .send(updatedWallet)
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')            
            res.body.should.have.property('_id').equals(wallet._id.toString())
            res.body.holdings[0].balance.should.equal(64)
            res.body.holdings[0].balance.should.not.equal(wallet.holdings[0].balance)
            done()
          })
      })
    })

    it('returns error on incorrect id', done => {
      chai.request(app)
        .put('/api/wallets/' + 'incorrectid')
        .end((err, res) => {
          res.should.have.status(500)
          done()
        })
    })
  })

  describe('/DELETE one wallet', () => {
    it('removes the item with the given id', done => {
      let wallet = new Wallet()
      wallet.save((err, wallet) => {
        chai.request(app)
          .delete('/api/wallets/' + wallet._id)
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body._id.should.be.equal(wallet._id.toString())
            chai.request(app)
              .get('/api/wallets/' + wallet._id)
              .end((err, res) => {
                res.should.have.status(200)
                should.not.exist(res.body)
                done()
              })
          })
      })
    })

    it('returns error on incorrect id', done => {
      chai.request(app)
        .delete('/api/wallets/' + 'incorrectid')
        .end((err, res) => {
          res.should.have.status(500)
          done()
        })
    })
  })
})