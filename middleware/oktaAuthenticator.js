const OktaJwtVerifier = require('@okta/jwt-verifier');

const oktaJwtVerifier = new OktaJwtVerifier({
  clientId: process.env.CLIENT_ID,
  issuer: `https://${process.env.OKTA_DOMAIN}/oauth2/default`,
  assertClaims: {
    aud: 'api://default',
  },
  testing: {
    disableHttpsCheck: false,
  },
});

/**
 * A simple middleware that asserts valid access tokens and sends 401 responses
 * if the token is not present or fails validation.  If the token is valid its
 * contents are attached to req.jwt
 */
const authenticationRequired = (req, res, next) => {
  // const authHeader = req.headers.authorization || '';
  const authHeader = req.header('token');
  const match = authHeader.match(/Bearer (.+)/);
  if (!match) {
    return res
      .status(401)
      .json({
        message: 'Bearer token not found',
      })
      .end();
  }

  const accessToken = match[1];
  const expectedAudience = 'api://default';

  return oktaJwtVerifier
    .verifyAccessToken(accessToken, expectedAudience)
    .then((jwt) => {
      req.jwt = jwt;
      // attach staffemail on the request to be used later
      req.oktaMail = jwt.claims.sub;
      next();
    })
    .catch((err) => {
      console.log({ message: err.message });
      res.status(401).json({
        message: err.message,
      });
    });
};

module.exports = authenticationRequired;
