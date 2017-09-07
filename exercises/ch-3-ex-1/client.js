const express = require("express")
const request = require("sync-request")
const url = require("url")
const qs = require("qs")
const queryString = require('querystring')
const cons = require('consolidate')
const randomString = require("randomstring")
const __ = require('underscore')
__.string = require('underscore.string')


const app = express()

app.engine('html', cons.underscore)
app.set('view engine', 'html')
app.set('views', 'files/client')

// authorization server information
const authServer = {
  authorizationEndpoint: 'http://localhost:9001/authorize',
  tokenEndpoint: 'http://localhost:9001/token'
}

// client information


/*
 * Add the client information in here
 */
const client = {
  "client_id": "oauth-client-1",
  "client_secret": "oauth-client-secret-1",
  "redirect_uris": ["http://localhost:9000/callback"]
}

const protectedResource = 'http://localhost:9002/resource'

let state = null
let access_token = null
let scope = null

app.get('/', function (req, res) {
  res.render('index', {access_token: access_token, scope: scope})
})

app.get('/authorize', function (req, res) {
  state = randomString.generate()
  const authorizedUrl = buildUrl(authServer.authorizationEndpoint, {
    response_type: 'code',
    client_id: client.client_id,
    redirect_uri: client.redirect_uris[0],
    state
  })
  res.redirect(authorizedUrl)
})

app.get('/callback', function (req, res) {
  if (req.query.state !== state) {
    const error = 'State value did not match'
    res.render('error', {error})
    return
  }

  const formData = qs.stringify({
    grant_type: 'authorization_code',
    code: req.query.code,
    redirect_uri: client.redirect_uris[0] // part of protocol
  })
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Basic ${encodeClientCredentials(client.client_id, client.client_secret)}`
  }
  const tokenRes = request('POST', authServer.tokenEndpoint,
    {
      'body': formData,
      'headers': headers
    })
  if (tokenRes.statusCode >= 200 && tokenRes.statusCode < 300) {
    const body = JSON.parse(tokenRes.getBody())
    access_token = body.access_token
    console.log('Got access token: %s', access_token)
    res.render('index', {access_token, scope})
  } else {
    res.render('error', {error: 'Unable to fetch access token, server response: ' + tokRes.statusCode})
  }
})

app.get('/fetch_resource', function (req, res) {
  if (!access_token) {
    const error = 'Missing access token.'
    res.render('error', {error})
    return
  }
  const headers = {
    'Authorization': `Bearer ${access_token}`
  }
  const resource = request('POST', protectedResource, {headers})
  if(resource.statusCode >= 200 && resource.statusCode < 300){
    const body = JSON.parse(resource.getBody())
    res.render('data', {resource:body})
  }else{
    const error = `Server returned response code: ${resource.statusCode}`
    res.render('error', {error})
  }


  /*
   * Use the access token to call the resource server
   */

})

const buildUrl = function (base, options, hash) {
  const newUrl = url.parse(base, true)
  delete newUrl.search
  if (!newUrl.query) {
    newUrl.query = {}
  }
  __.each(options, function (value, key) {
    newUrl.query[key] = value
  })
  if (hash) {
    newUrl.hash = hash
  }

  return url.format(newUrl)
}

const encodeClientCredentials = function (clientId, clientSecret) {
  return new Buffer(queryString.escape(clientId) + ':' + queryString.escape(clientSecret)).toString('base64')
}

app.use('/', express.static('files/client'))

const server = app.listen(9000, 'localhost', function () {
  const address = server.address()
  console.log(`OAuth Client is listening at http://${address.address}:${address.port}`)
})
 
