process.env.NODE_ENV = 'test'

let mongoose = require('mongoose')
let Mockgoose = require('mockgoose').Mockgoose
let mockgoose = new Mockgoose(mongoose)

let app = require('../app')
let Promise = require('bluebird');
let userController = require('../src/api/user/user.controller')
let User = require('../src/api/user/user.model')
const mockUser = require('../src/api/user/user.mock')

let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()

chai.use(chaiHttp)

describe('Users', () => {
  beforeEach( done => {
    User.remove({}, err => { done() })
  })

  afterEach(done => {
    User.remove({}, err => { done() })
  })

  describe('/GET all users', () => {
    it('gets empty array by default', done => {
      chai.request(app)
        .get('/api/users')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.equal(0)
          done()
        })
    })

    it('gets all users', done => {
      let user1 = new User(mockUser[0])
      let user1promise = user1.save()
      let user2 = new User(mockUser[1])
      let user2promise = user2.save()

      Promise.all([user1promise, user2promise])
        .then((values) => {
          chai.request(app)
            .get('/api/users')
            .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.a('array')
              res.body.should.have.length(2)
              done()
            })
        })
    })
  })

  describe('/GET user by name', () => {
    it('returns the correct user', async () => {
      let user = mockUser[0];
      let user2 = mockUser[1];

      await userController.create(user)
      await userController.create(user2)

      let c = chai.request(app)
        .get(`/api/users?username=${user.username}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.username.should.equal(user.username)
          res.body.email.should.equal(user.email)
        })
    })
  })

  describe('/POST a user', () => {
    it('adds a new user', done => {
      let user = mockUser[0];
      chai.request(app)
        .post('/api/users')
        .send(user)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('_id')
          res.body.username.should.equal(user.username)
          res.body.email.should.equal(user.email)
          done()
        })
    })

    it('ignores the _id field', done => {
      let user = mockUser[0]
      chai.request(app)
      .post('/api/users')
      .send(user)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('_id')
        res.body.username.should.equal(user.username)
        done()
      })
    })
  })

  describe('/DELETE all users', () => {
    it('removes all users', done => {
      let user1 = new User(mockUser[0])
      let user1promise = user1.save()
      let user2 = new User(mockUser[1])
      let user2promise = user2.save()

      Promise.all([user1promise, user2promise])
        .then((values) => {
          chai.request(app)
            .delete('/api/users')
            .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.ok.should.be.equal(1)
              chai.request(app)
                .get('/api/users')
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

  describe('/GET one user', () => {
    it('returns one user by id', done => {
      let user = new User(mockUser[0])
      user.save((err, user) => {
        chai.request(app)
          .get('/api/users/' + user._id)
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('_id').equals(user._id.toString())
          done()
          })
      })
    })

    it('returns error on incorrect id', () => {
      chai.request(app)
        .get('/api/users/' + 'incorrectid')
        .end((err, res) => {
          res.should.have.status(500)
        })
    })
  })

  describe('/PUT an update', () => {
    it('modifies the selected user', done => {
      let user = new User(mockUser[0])
      user.save((err, user) => {
        user.email = 'updatedEmail'
        chai.request(app)
          .put('/api/users/' + user._id)
          .send(user)
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')            
            res.body.should.have.property('_id').equals(user._id.toString())
            res.body.username.should.equal(user.username)
            res.body.email.should.equal(user.email)
            done()
          })
      })
    })

    it('returns error on incorrect id', done => {
      chai.request(app)
        .put('/api/users/' + 'incorrectid')
        .end((err, res) => {
          res.should.have.status(500)
          done();
        })
    })
  })

  describe('/DELETE one user', () => {
    it('removes the item with the given id', done => {
      let user = new User(mockUser[0])
      user.save((err, user) => {
        chai.request(app)
          .delete('/api/users/' + user._id)
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body._id.should.be.equal(user._id.toString())
            chai.request(app)
              .get('/api/users/' + user._id)
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
        .delete('/api/users/' + 'incorrectid')
        .end((err, res) => {
          res.should.have.status(500)
          done()
        })
    })
  })
})