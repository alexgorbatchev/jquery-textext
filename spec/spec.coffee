do ->
  window.expect = chai.expect
  window.should = chai.should
  window.spy = sinon.spy

  Assertion = chai.Assertion

  Assertion.addChainableMethod 'called', (done) ->
    { object, negate } = @__flags

    expect(object).to.have.property 'called'

    next = =>
      setTimeout =>
        if (negate and not object.called) or object.called
          done()
        else if not runner.test.timedOut
          next()
      , 0

    next()

  $.fx.off = true

  runner = mocha.run()
