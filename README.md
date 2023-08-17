# Online Store Project
## Table of Contents
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Starting the project up](#starting-the-project-up)
  - [Terminology](#terminology)
      - [Access Token](#access-token)
      - [Refresh Token](#refresh-token)
  - [API Documentation](#api-documentation)
    - [Base URL for REST endpoints](#base-url-for-rest-endpoints)
    - [Base URL for GraphQL queries and mutations](#base-url-for-graphql-queries-and-mutations)
    - [Authentication Note](#authentication-note)
    - [Authentication Endpoints](#authentication-endpoints)
      - [Endpoint #1. Sign In](#endpoint-1-sign-in)
      - [Endpoint #2. Request a new access token](#endpoint-2-request-a-new-access-token)
      - [Endpoint #3. Sign Up](#endpoint-3-sign-up)
      - [Endpoint #4. Checking email availability](#endpoint-4-checking-email-availability)
      - [Endpoint #5. Activate an account](#endpoint-5-activate-an-account)
      - [Endpoint #6. Resend an activation link](#endpoint-6-resend-an-activation-link)
      - [Endpoint #7. Sending a link to reset the password](#endpoint-7-sending-a-link-to-reset-the-password)
      - [Endpoint #8. Verify if a reset token is valid](#endpoint-8-verify-if-a-reset-token-is-valid)
      - [Endpoint #9. Change a user's password](#endpoint-9-change-a-users-password)
      - [Endpoint #10. Get a link to the Google/Facebook authorization server](#endpoint-10-get-a-link-to-the-googlefacebook-authorization-server)
      - [Endpoint #11. OAuth 2.0 Callback](#endpoint-11-oauth-20-callback)
      - [Endpoint #12. Logout](#endpoint-12-logout)

## Prerequisites
- Install Docker and Docker Compose
- Move the "dev.env" file to the "server/config" folder
- Move "redis.conf" to the "redis" folder
## Starting the project up
```bash
git clone https://github.com/Lyoshas/onlineStore.git
# then move "dev.env" and "redis.conf" to the corresponding folders
cd onlineStore
docker-compose up
```

## Terminology
#### Access Token
An access token is short-lived, typically lasting 10-15 minutes. It is used for making sensitive API calls.

To include the access token in your requests, add it to the HTTP header as follows:

`Authorization: Bearer YOUR_ACCESS_TOKEN`

#### Refresh Token
A refresh token has a longer lifespan, usually lasting for 1 month. It is used exclusively to refresh access tokens when they expire. The refresh token is sent as a cookie in the request.

Note: Refresh tokens should only be used for refreshing access tokens and should not be included in sensitive API calls.

To refresh your access token, make a request to:

`GET /api/refresh`

Include the refresh token in the request to obtain a new access token (more about this endpoint [here](#endpoint-2-request-a-new-access-token))

## API Documentation
### Base URL for REST endpoints
The base URL for all API endpoints is: **http://localhost/api**
### Base URL for GraphQL queries and mutations
The base URL for all GraphQL requests is: **http://localhost/api/graphql**

Always use **POST** when making GraphQL requests.

### Authentication Note
Some API endpoints require authentication using access tokens and refresh tokens.

### Authentication Endpoints
#### Endpoint #1. Sign In
- **URL:** /api/auth/sign-in
- **Method:** POST
- **Description:** signs the user in. The user's account must be activated before signing in.
- **Who can access:** everyone
- **Rate limiting:** none
- **Request body:**
  - _login_ - must be specified and must be a string.
  - _password_ - must be specified and must be a string.
  - _recaptchaToken_ - retrieved when the user completes the ReCAPTCHA v2 challenge. Must be specified and must be valid.
- **Request params:** none
- **Query string parameters:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200 OK
  - **Description:** the user has been logged in
  - **Content:**
    ```JSON
    {
        "accessToken": "JWT_value"
    }
    ```
    The refresh token is also included as a cookie. It is included with the parameter name "refreshToken". This cookie has the following options:
    ```javascript
    {
      // this cookie is only attached in the '/api/auth' path
      path: '/api/auth',
      // this cookie is not accessible from browser JS
      httpOnly: true,
      // the cookie will only be sent in requests originating from the same site as the one that set the cookie
      sameSite: 'strict',
    }
    ```
- **Error responses**:
  - Invalid login and/or password
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
          "errors": [
              {
                  "message": "Invalid credentials"
              }
          ]
      }
      ```
  - Account is not activated
    - **Status code**: 403 Forbidden
    - **Content**:
      ```JSON
      {
          "errors": [
              {
                  "message": "Invalid credentials"
              }
          ]
      }
      ```
  - Invalid request body parameters (initial validation by 'express-validator' failed). See the parameter requirements above.
    - **Status code**: 422 Unprocessable Entity
    - **Content (example)**:
      ```JSON
      {
        "errors": [
          {
              "message": "recaptchaToken must be specified",
              "field": "recaptchaToken"
          },
          {
              "message": "recaptchaToken must be a string",
              "field": "recaptchaToken"
          },
          ...
      }
      ```
#### Endpoint #2. Request a new access token
- **URL:** /api/auth/refresh
- **Method:** GET
- **Description:** refreshes the access token by utilizing a refresh token as a cookie.
- **Who can access:** everyone
- **Rate limiting:** none
- **Request body:** empty
- **Request params:** none
- **Query string parameters:** none
- **Required cookies:** a valid 'refreshToken' must be must be specified as a cookie
- **Success response:**
  - **Status code:** 200 OK
  - **Description:** the refresh token is correct, so the renewed access token is provided in the response body
  - **Content:**
    ```JSON
    {
        "accessToken": "new_JWT_value"
    }
    ```
- **Error responses**:
  - The refresh token is not specified (validation by 'express-validator' failed)
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "refreshToken must not be empty",
            "field": "refreshToken"
          }
        ]
      }
      ```
  - The refresh token is specified, but is invalid (custom validation failed)
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "Invalid refresh token",
            "field": "refreshToken"
          }
        ]
      }
      ```
#### Endpoint #3. Sign Up
- **URL:** /api/auth/sign-up
- **Method:** POST
- **Description:** signs the user up
- **Who can access:** everyone
- **Rate limiting:** none
- **Request body:**
  - _firstName_ - must be a string and must be 1 to 50 characters long
  - _lastName_ - must be a string and must be 1 to 50 characters long
  - _email_ - must be a valid email with up to 254 characters. This email must be unique, meaning no two users can have the same email.
  - _password_ - must consist of at least 8 characters, not exceeding 72 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character
  - _phoneNumber_ - optional parameter. If specified, it must be a string that conforms to this schema: '+380-XX-XXX-XX-XX' (e.g. +380-12-345-67-89). The phone number must be unique.
  - _recaptchaToken_ - retrieved when the user completes the ReCAPTCHA v2 challenge. Must be specified and must be valid.
- **Request params:** none
- **Query string parameters:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 201 Created
  - **Description:** The user has signed up successfully. The activation link has been sent to the specified email.
  - **Content:**
    ```JSON
    {
      "msg": "A new account has been created. Email confirmation is required.",
    }
    ```
- **Error responses**:
  - Invalid request body parameters (initial validation by 'express-validator' failed). See the parameter requirements above.
    - **Status code**: 422 Unprocessable Entity
    - **Content (example)**:
      ```JSON
      {
        "errors": [
          {
            "message": "refreshToken must not be empty",
            "field": "refreshToken"
          }
        ]
      }
      ```
  - The refresh token is specified, but is invalid (custom validation failed)
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "Invalid refresh token",
            "field": "refreshToken"
          }
        ]
      }
      ```
#### Endpoint #4. Checking email availability
- **URL:** /api/auth/is-email-available
- **Method:** POST
- **Description:** signs the user up
- **Who can access:** everyone
- **Rate limiting:** 1 request per second per IP address
- **Request body:** empty
- **Request params:** none
- **Query string parameters:**
  - email - the email you are trying to check (e.g. ?email=test@test.com). Must be a valid email.
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200 OK
  - **Description:** The request didn't cause any errors.
  - **Content:**
    ```JSON
    {
      "isEmailAvailable": true | false
    }
    ```
- **Error responses**:
  - Invalid query string parameters (initial validation by 'express-validator' failed). See the parameter requirements above.
    - **Status code**: 422 Unprocessable Entity
    - **Content (example)**:
      ```JSON
      {
        "errors": [
          {
            "message": "the field \"email\" must be a correct email address",
            "field": "email"
          }
        ]
      }
      ```
  - Too many requests are sent from one IP address.
    - **Status code**: 503 Service Temporarily Unavailable
    - **Content**:
        ```HTML
        <html>

        <head>
            <title>503 Service Temporarily Unavailable</title>
        </head>

        <body>
            <center>
                <h1>503 Service Temporarily Unavailable</h1>
            </center>
            <hr>
            <center>nginx/1.25.1</center>
        </body>

        </html>
        ```
#### Endpoint #5. Activate an account
- **URL:** /api/auth/activate-account/:activationToken
- **Method:** PATCH
- **Description:** activates the account. This endpoint is typically used when the user follows the activation link that is sent after the user signs up.
- **Who can access:** everyone
- **Rate limiting:** none
- **Request body:** empty
- **Request params:**
  - _activationToken_ - a token that is used to activate an account. The API server generates this token after the user signs up and then sends it to the user's email. The user then follows the link with this activation token.
- **Query string parameters:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200 OK
  - **Description:** the account has been activated successfully
  - **Content:**
    ```JSON
    {
      "msg": "The account has been activated"
    }
    ```
- **Error responses**:
  - The specified activation token is either invalid or has expired
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The activation token is either invalid or expired",
            "field": "activationToken"
          }
        ]
      }
      ```
#### Endpoint #6. Resend an activation link
- **URL:** /api/auth/resend-activation-link
- **Method:** POST
- **Description:** resends the activation link to the user. If a user tries to sign in with an account that is not activated, they won't be able to sign in, but they will be presented with an option to resend the activation link. This endpoint is used when the user agrees to resend the link.
- **Who can access:** everyone
- **Rate limiting:** 1 request per second per IP address
- **Request body:**
  - _login_ - a mobile phone (+380-XX-XXX-XX-XX) or an email. Must not be empty.
  - _password_ - a password that is associated with the login. Must not be empty.
  - _recaptchaToken_ - retrieved when the user completes the ReCAPTCHA v2 challenge. Must be specified and must be valid.
- **Request params:** none
- **Query string parameters:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200 OK
  - **Description:** the link has been resent to the specified email
  - **Content:**
    ```JSON
    {
      // indicates which email this message was sent to
      "targetEmail": "example@example.com"
    }
    ```
- **Error responses**:
  - Invalid request body parameters (initial validation by 'express-validator' failed). See the parameter requirements above.
    - **Status code**: 422 Unprocessable Entity
    - **Content (example)**:
      ```JSON
      {
        "errors": [
          {
            "message": "recaptchaToken must be specified",
            "field": "recaptchaToken"
          },
          {
            "message": "recaptchaToken must be a string",
            "field": "recaptchaToken"
          },
          {
            "message": [
              "invalid-input-response"
            ],
            "field": "recaptchaToken"
          },
          {
            "message": "login must not be empty",
            "field": "login"
          },
          {
            "message": "password must not be empty",
            "field": "password"
          }
        ]
      }
      ```
  - The provided login and/or password is incorrect.
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "Invalid credentials"
          }
        ]
      }
      ```
  - The account is already activated.
    - **Status code**: 409 Conflict
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "Account is already activated"
          }
        ]
      }
      ```
  - Too many requests are sent from one IP address.
    - **Status code**: 503 Service Temporarily Unavailable
    - **Content**:
        ```HTML
        <html>

        <head>
            <title>503 Service Temporarily Unavailable</title>
        </head>

        <body>
            <center>
                <h1>503 Service Temporarily Unavailable</h1>
            </center>
            <hr>
            <center>nginx/1.25.1</center>
        </body>

        </html>
        ```
#### Endpoint #7. Sending a link to reset the password
- **URL:** /api/auth/send-reset-token
- **Method:** POST
- **Description:** if a user wants to change their password, this endpoint will be used to send a reset link to their email.
- **Who can access:** everyone
- **Rate limiting:** none
- **Request body:**
  - _email_ - must be a correct email and must not be empty
  - _recaptchaToken_ - retrieved when the user completes the ReCAPTCHA v2 challenge. Must be specified and must be valid.
- **Request params:** none
- **Query string parameters:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200 OK
  - **Description:** the link has been sent successfully to the specified email
  - **Content:**
    ```JSON
    {
        "msg": "The link has been sent to the corresponding email"
    }
    ```
- **Error responses**:
  - Invalid request body parameters (initial validation by 'express-validator' failed). See the parameter requirements above.
    - **Status code**: 422 Unprocessable Entity
    - **Content (example)**:
      ```JSON
      {
        "errors": [
          {
            "message": [
                "invalid-input-response"
            ],
            "field": "recaptchaToken"
          },
          {
            "message": "email must not be empty",
            "field": "email"
          },
          {
            "message": "email is not correct",
            "field": "email"
          }
        ]
      }
      ```
  - There is no user with the specified email
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "There is no user with the corresponding email",
            "field": "email"
          }
        ]
      }
      ```
#### Endpoint #8. Verify if a reset token is valid
- **URL:** /api/auth/is-reset-token-valid/:resetToken
- **Method:** PATCH
- **Description:** if a user tries to change their password, they would first use [this endpoint](#endpoint-7-sending-a-link-to-reset-the-password). After the reset link is sent to their email and they follow it, the client (React.js or a mobile app) should make a request to this endpoint to verify whether the reset token is valid. This step is important because if the user followed the link and the link had actually expired, the user would find out about this only after they filled in the form, solved the captcha challenge and sent the form. This would be very frustrating for users. Thus it's important to notify the user about reset token expiration ahead of time by using this endpoint.
- **Who can access:** everyone
- **Rate limiting:** 1 request per second per IP address
- **Request body:** none
- **Request params:**
  - _resetToken_ - a token that is used to reset a user's password.
- **Query string parameters:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200 OK
  - **Description:** the request didn't cause any errors
  - **Content:**
    ```JSON
    {
      "isValid": true | false
    }
    ```
- **Error responses**:
  - Too many requests are sent from one IP address.
    - **Status code**: 503 Service Temporarily Unavailable
    - **Content**:
        ```HTML
        <html>

        <head>
            <title>503 Service Temporarily Unavailable</title>
        </head>

        <body>
            <center>
                <h1>503 Service Temporarily Unavailable</h1>
            </center>
            <hr>
            <center>nginx/1.25.1</center>
        </body>

        </html>
        ```
#### Endpoint #9. Change a user's password
- **URL:** /api/auth/change-password
- **Method:** PATCH
- **Description:** changes a user's password. This endpoint revokes the reset token after the password is changed.
- **Who can access:** everyone
- **Rate limiting:** 1 request per second per IP address
- **Request body:**
  - _resetToken_ - a token that will be used to identify which user this request applies to. Must be a string and must not be empty. The reset token is revoked after the password is changed.
  - _password_ - a new password that will be applied to the corresponding user. Must consist of at least 8 characters, not exceeding 72 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character
  - _recaptchaToken_ - retrieved when the user completes the ReCAPTCHA v2 challenge. Must be specified and must be valid.
- **Request params:** none
- **Query string parameters:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200 OK
  - **Description:** the password has been changed successfully
  - **Content:**
    ```JSON
    {
      "msg": "The password has been changed"
    }
    ```
- **Error responses**:
  - Invalid request body parameters (initial validation by 'express-validator' failed). See the parameter requirements above.
    - **Status code**: 422 Unprocessable Entity
    - **Content (example)**:
      ```JSON
      {
        "errors": [
          {
            "message": [
              "invalid-input-response"
            ],
            "field": "recaptchaToken"
          },
          {
            "message": "resetToken must not be empty",
            "field": "resetToken"
          },
          {
            "message": "the field \"password\" must consist of at least 8 characters, not exceeding 72 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character",
            "field": "password"
          }
        ]
      }
      ```
  - The reset token is either invalid or has expired
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "resetToken is either invalid or has expired",
            "field": "resetToken"
          }
        ]
      }
      ```
  - Too many requests are sent from one IP address.
    - **Status code**: 503 Service Temporarily Unavailable
    - **Content**:
        ```HTML
        <html>

        <head>
            <title>503 Service Temporarily Unavailable</title>
        </head>

        <body>
            <center>
                <h1>503 Service Temporarily Unavailable</h1>
            </center>
            <hr>
            <center>nginx/1.25.1</center>
        </body>

        </html>
        ```
#### Endpoint #10. Get a link to the Google/Facebook authorization server
- **URL:** /api/auth/oauth-link/:authorizationServerName
- **Method:** GET
- **Description:** generates and returns a link to the Google/Facebook authorization server. This link is for one-time use only; once it has been used, it cannot be used again. Used for OAuth 2.0 purposes.
- **Who can access:** everyone
- **Rate limiting:** none
- **Request body:** empty
- **Request params:**
  - _authorizationServerName_ - the name of the resource the user is trying to log in with. As of now, this value can be set to either 'google' or 'facebook'.
- **Query string parameters:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200 OK
  - **Description:** the link has been generated successfully
  - **Content:**
    ```JSON
    {
      // this link will be used by users to log in via their Google/Facebook account
      "URL": "http://link-to-the-authorization-server.example"
    }
    ```
- **Error responses**:
  - Invalid 'authorizationServerName' parameter.
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "Invalid authorization server name: it can be either \"google\" or \"facebook\"",
            "field": "authorizationServerName"
          }
        ]
      }
      ```
#### Endpoint #11. OAuth 2.0 Callback
- **URL:** /api/auth/oauth-callback
- **Method:** POST
- **Description:** a user is redirected to the OAuth 2.0 callback page once they have consented to log in via their Google/Facebook account. They will be redirected to the client (React or mobile app) and the client will then make an API request to this endpoint to get the access token. If the user makes a request here for the first time, the API server will sign the user up, otherwise the user will be logged in.
- **Who can access:** everyone
- **Rate limiting:** none
- **Request body:** empty
- **Request params:** none
- **Query string parameters:**
  - _state_ - a random string that was generated by our API server when creating a link to the OAuth 2.0 authorization server. It's used to verify whether the request is authentic and to prevent CSRF attacks. Must be a string.
  - _code_ - a single-use authorization code that the OAuth 2.0 authorization server returns to the client application after the user grants permission. Its single purpose is to use it to exchange it to the access token. Must be a string.
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200 OK (if the user logged in) | 201 Created (if the user signed up and then logged in)
  - **Description:** the OAuth 2.0 flow went successfully
  - **Content:**
    ```JSON
    {
      // this access token is used to log in to our application 
      "accessToken": "JWT_ACCESS_TOKEN"
    }
    ```
- **Error responses**:
  - Invalid 'state' parameter (unauthentic request).
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "Invalid \"state\" parameter",
            "field": "state"
          }
        ]
      }
      ```
#### Endpoint #12. Logout
- **URL:** /api/auth/logout
- **Method:** POST
- **Description:** deletes the provided refresh token from the DB and removes it as a cookie
- **Who can access:** everyone
- **Rate limiting:** 1 request per second per IP address
- **Request body:** empty
- **Request params:** none
- **Query string parameters:** none
- **Required cookies:**
  - _refreshToken_ - must not be empty
- **Success response:**
  - **Status code:** 204 No Content
  - **Description:** indicates that the request was successful and the refresh token, if it existed in the database, has been deleted. If the provided refresh token was not found in the database, this response will also be returned to indicate that no changes were made.
  - **Content:** empty
- **Error responses**:
  - Refresh token was not provided
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "refreshToken must not be empty",
            "field": "refreshToken"
          }
        ]
      }
      ```
