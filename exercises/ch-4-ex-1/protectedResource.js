const express = require("express")
const bodyParser = require('body-parser')
const cons = require('consolidate')
const nosql = require('nosql').load('database.nosql')
const __ = require('underscore')
const cors = require('cors')

const app = express()

app.use(bodyParser.urlencoded({extended: true})) // support form-encoded bodies (for bearer tokens)

app.engine('html', cons.underscore)
app.set('view engine', 'html')
app.set('views', 'files/protectedResource')
app.set('json spaces', 4)

app.use('/', express.static('files/protectedResource'))
app.use(cors())

const resource = {
  "name": "Protected Resource",
  "description": "This data has been protected by OAuth 2.0"
}

const getAccessToken = function (req, res, next) {
  /*
   * Scan for an access token on the incoming request.
   */

}

app.options('/resource', cors())


/*
 * Add the getAccessToken function to this handler
 */
app.post("/resource", cors(), function (req, res) {

  /*
   * Check to see if the access token was found or not
   */

})

const server = app.listen(9002, 'localhost', function () {
  const host = server.address().address
  const port = server.address().port

  console.log('OAuth Resource Server is listening at http://%s:%s', host, port)
})
 
