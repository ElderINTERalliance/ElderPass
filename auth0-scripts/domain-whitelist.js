/*
 * This script needs to be copied and pasted into Auth0
 * https://manage.auth0.com/dashboard/us/$SERVER_NAME/rules
 */

function emailDomainWhitelist(user, context, callback) {
  "use strict";

  // Access should only be granted to verified users.
  if (!user.email || !user.email_verified) {
    return callback(new UnauthorizedError("Access denied. Email either doesn't exist or was not verified."));
  }

  const [username, mailserver] = user.email.split("@");
  const usernameRegex = /^(e\d\d-|eld-).*$/gm;
  const validUsername = !usernameRegex.test(username);
  const validServer = mailserver === "elderhs.net";
  const userHasAccess = validUsername && validServer;

  const whitelist = ["e22-sargentzw@elderhs.net"];
  const userInWhitelist = whitelist.some(email => email === user.email);

  if (!userHasAccess && !userInWhitelist) {
    return callback(new UnauthorizedError('Access denied. Your email was not recognized as a teacher.'));
  }

  return callback(null, user, context);
}


