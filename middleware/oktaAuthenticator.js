const OktaJwtVerifier = require('@okta/jwt-verifier');

const yourOktaDomain = '';

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: `https://${yourOktaDomain}/oauth2/default`,
  clientId: '{clientId}',
  assertClaims: {
    aud: 'api://default'
  }
});

/**
 * A simple middleware that asserts valid access tokens and sends 401 responses
 * if the token is not present or fails validation.  If the token is valid its
 * contents are attached to req.jwt
 */
const authenticationRequired = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/Bearer (.+)/);

  if (!match) {
    return res.status(401).end();
  }

  const accessToken = match[1];
  const expectedAudience = 'api://default';

  return oktaJwtVerifier
    .verifyAccessToken(accessToken, expectedAudience)
    .then((jwt) => {
      req.jwt = jwt;
      next();
    })
    .catch((err) => {
      res.status(401).send(err.message);
    });
};

module.exports = authenticationRequired;
