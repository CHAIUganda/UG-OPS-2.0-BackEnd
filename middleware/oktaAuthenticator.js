const OktaJwtVerifier = require('@okta/jwt-verifier');

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: `https://${process.env.OKTA_DOMAIN}/oauth2/default`,
  clientId: process.env.CLIENT_ID,
  assertClaims: {
    aud: 'api://default',
    cid: process.env.CLIENT_ID,
  },
});

/**
 * A simple middleware that asserts valid access tokens and sends 401 responses
 * if the token is not present or fails validation.  If the token is valid its
 * contents are attached to req.jwt
 */
const authenticationRequired = (req, res, next) => {
  // const authHeader = req.headers.authorization || '';
  console.log(`OKTA_DOMAIN :: ${process.env.OKTA_DOMAIN}`);
  console.log();
  console.log(`CLIENT_ID :: ${process.env.CLIENT_ID}`);
  console.log();
  const authHeader = req.header('token');
  const match = authHeader.match(/Bearer (.+)/);
  console.log(`Match :: ${match}`);
  console.log();
  console.log(`AuthHeader :: ${authHeader}`);
  console.log();

  if (!match) {
    console.log('if match is false');
    return res.status(401).end();
  }
  console.log('After match');
  const accessToken = match[1];
  const expectedAudience = 'api://default';
  console.log(`Access Token :: ${accessToken}`);
  console.log();
  console.log(`expectedAudience :: ${expectedAudience}`);
  console.log();
  return oktaJwtVerifier
    .verifyAccessToken(accessToken, expectedAudience)
    .then((jwt) => {
      req.jwt = jwt;
      console.log({ message: 'verified', jwt });
      next();
    })
    .catch((err) => {
      console.log({ error: err.message });
      res.status(401).send(err.message);
    });
};

module.exports = authenticationRequired;
