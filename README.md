# Online Store Project
## Table of Contents
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
    - [Product Category Endpoints](#product-category-endpoints)
      - [Get all product categories](#get-all-product-categories)
    - [GraphQL Queries and Mutations](#graphql-queries-and-mutations)
      - [1. Get basic information about an individual product (optionally with reviews to this product as well)](#1-get-basic-information-about-an-individual-product-optionally-with-reviews-to-this-product-as-well)
      - [2. Get a list of products by specifying a category and a page](#2-get-a-list-of-products-by-specifying-a-category-and-a-page)
      - [3. Get a list of products by search query](#3-get-a-list-of-products-by-search-query)
      - [4. Get featured products](#4-get-featured-products)
      - [5. Add a product review](#5-add-a-product-review)
    - [Cart Endpoints](#cart-endpoints)
      - [1. Get the contents of your shopping cart](#1-get-the-contents-of-your-shopping-cart)
      - [2. Get the total number of items in the cart](#2-get-the-total-number-of-items-in-the-cart)
      - [3. Add an item to the cart or change its quantity in the cart](#3-add-an-item-to-the-cart-or-change-its-quantity-in-the-cart)
      - [4. Remove the specified product from the cart](#4-remove-the-specified-product-from-the-cart)
      - [5. Check if it's safe to add a product to the local cart](#5-check-if-its-safe-to-add-a-product-to-the-local-cart)
      - [6. Synchronize the local cart with the API](#6-synchronize-the-local-cart-with-the-api)
      - [7. Get the maximum number of items that a user is allowed to have in the cart](#7-get-the-maximum-number-of-items-that-a-user-is-allowed-to-have-in-the-cart)
    - [Shipping Endpoints](#shipping-endpoints)
      - [1. Get a list of supported cities for shipping](#1-get-a-list-of-supported-cities-for-shipping)
      - [2. Get all Nova Poshta branches (відділення) and pickup points (пункти)](#2-get-all-nova-poshta-branches-відділення-and-pickup-points-пункти)
    - [User Endpoints](#user-endpoints)
      - [1. Get the profile of the user who makes the request](#1-get-the-profile-of-the-user-who-makes-the-request)
    - [Order Endpoints](#order-endpoints)
      - [1. Check order feasibility](#1-check-order-feasibility)
      - [2. Get order recipients associated with a single user](#2-get-order-recipients-associated-with-a-single-user)
      - [3. Create a new order](#3-create-a-new-order)
      - [4. Process a payment (LiqPay callback)](#4-process-a-payment-liqpay-callback)
      - [5. Get a list of orders](#5-get-a-list-of-orders)
    - [Warranty Request Endpoints](#warranty-request-endpoints)
      - [1. Get a list of warranty requests for the current user](#1-get-a-list-of-warranty-requests-for-the-current-user)
    - [Fundraising Campaign Endpoints](#fundraising-campaign-endpoints)
      - [1. Get a list of fundraising campaigns](#1-get-a-list-of-fundraising-campaigns)
      - [2. Create a new pending transaction](#2-create-a-new-pending-transaction)
      - [3. Process a donation (LiqPay callback)](#3-process-a-donation-liqpay-callback)
    - [Health Endpoints](#health-endpoints)
      - [1. Health check](#1-health-check)

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
                  "message": "The account is not activated"
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
- **Method:** GET
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
  - _login_ - an email associated with the user who wants to resend the activation link. Must not be empty.
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
- **Method:** GET
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

### Product Category Endpoints
#### Get all product categories
- **URL:** /api/product/categories
- **Method:** GET
- **Description:** returns all possible product categories that are in the database.
- **Who can access:** everyone
- **Rate limiting:** none
- **Request body:** empty
- **Request params:** none
- **Query string parameters:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200 OK
  - **Description:** the product categories were fetched successfully
  - **Content:**
    ```JSON
    {
      "categories": [
        {
          "name": "Ігрові консолі",
          "previewURL": "https://onlinestore-react-assets.s3.amazonaws.com/product-categories/consoles.png"
        },
        {
          "name": "Ноутбуки",
          "previewURL": "https://onlinestore-react-assets.s3.amazonaws.com/product-categories/laptops.png"
        },
        {
          "name": "Персональні комп'ютери",
          "previewURL": "https://onlinestore-react-assets.s3.amazonaws.com/product-categories/personal-computers.png"
        },
        {
          "name": "Планшети",
          "previewURL": "https://onlinestore-react-assets.s3.amazonaws.com/product-categories/tablets.png"
        },
        {
          "name": "Смартфони",
          "previewURL": "https://onlinestore-react-assets.s3.amazonaws.com/product-categories/smartphones.png"
        },
        {
          "name": "HDD",
          "previewURL": "https://onlinestore-react-assets.s3.amazonaws.com/product-categories/hdd.png"
        },
        {
          "name": "SSD",
          "previewURL": "https://onlinestore-react-assets.s3.amazonaws.com/product-categories/ssd.png"
        },
        {
          "name": "Процесори",
          "previewURL": "https://onlinestore-react-assets.s3.amazonaws.com/product-categories/processors.png"
        },
        {
          "name": "Відеокарти",
          "previewURL": "https://onlinestore-react-assets.s3.amazonaws.com/product-categories/gpus.png"
        },
        {
          "name": "Оперативна пам'ять",
          "previewURL": "https://onlinestore-react-assets.s3.amazonaws.com/product-categories/ram.png"
        },
        {
          "name": "Монітори",
          "previewURL": "https://onlinestore-react-assets.s3.amazonaws.com/product-categories/monitors.png"
        }
      ]
    }
    ```

### GraphQL Queries and Mutations
#### 1. Get basic information about an individual product (optionally with reviews to this product as well)
- **Who can access:** everyone (but if you request the 'isInTheCart' or 'userCanAddReview' fields, you have to provide a valid access token)
- **Required parameters:**
  - _id_ - the id of the product that you are trying to get information about. Must be a number.
- **Example**:
  ```graphql
  query Product($productId: Int!) {
    product(id: $productId) {
      id
      title
      price
      category
      initialImageUrl
      additionalImageUrl
      shortDescription
      isInTheCart
      isAvailable
      isRunningOut
      # only one review is allowed per user for each product, so 'userCanAddReview' specifies whether the user can post a review or not
      userCanAddReview
      userRating # ranges from 1 to 5 in increments of 0.5, can be null if there are no reviews
      reviews {
        userId
        fullName
        reviewMessage
        starRating
        createdAt
      }
    }
  }
  ```
  **Result (example)**:
  ```JSON
  {
    "data": {
      "product": {
        "id": 635,
        "title": "SSD диск Kingston KC3000 1TB M.2 2280 NVMe PCIe Gen 4.0 x4 3D TLC NAND (SKC3000S/1024G)",
        "price": 3199,
        "category": "SSD",
        "initialImageUrl": "https://onlinestore-product-images.s3.amazonaws.com/564a7f3b-c26c-4516-ae64-ff1874edd404.png",
        "additionalImageUrl": "https://onlinestore-product-images.s3.amazonaws.com/65950bef-58c4-4248-8b83-5f9161711889.png",
        "shortDescription": "Kingston KC3000 SKC3000D/1024G - це SSD-накопичувач PCIe 4.0 NVMe M.2, який забезпечує швидкість зчитування і запису даних до 7000 МБ/с. Цей накопичувач ідеально підходить для систем, які вимагають високої продуктивності для таких завдань, як ігри, редагування відео та створення контенту.",
        "isInTheCart": false,
        "userCanAddReview": false,
        "isAvailable": true,
        "isRunningOut": false,
        "userRating": 4.5,
        "reviews": [
          {
            "userId": 615,
            "fullName": "Сергій Дмитрук",
            "reviewMessage": "SSD на високому рівні. Але здається, що ціна за бренд.",
            "starRating": 4,
            "createdAt": "14.06.2024"
          },
          {
            "userId": 660,
            "fullName": "Вадим Щербаков",
            "reviewMessage": "Непогана швидкість, але вартість занадто висока.",
            "starRating": 4,
            "createdAt": "23.03.2023"
          }
        ]
      }
    }
  }
  ```
- **Error responses**:
  - The specified product id doesn't exist
    ```JSON
    {
      "data": {},
      "errors": [
        {
          "message": "A product with the specified id does not exist"
        }
      ]
    }
    ```
  - The user is trying to access the 'isInTheCart' field while being unauthenticated
    ```JSON
    {
      "data": {},
      "errors": [
        {
          "message": "User must be authenticated to request the \"isInTheCart\" field"
        }
      ]
    }
    ```
  - The user is trying to access the 'userCanAddReview' field while being unauthenticated
    ```JSON
    {
      "data": {},
      "errors": [
        {
          "message": "User must be authenticated to request the \"userCanAddReview\" field"
        }
      ]
    }
    ```
#### 2. Get a list of products by specifying a category and a page
- **Who can access:** everyone (but if you request the 'isInTheCart' field, you have to provide a valid access token)
- **Required parameters:**
  - _category_ - the category of the products you are trying to fetch. Must be a string and must be an existing product category
  - _page_ - the product page that you are trying to access. Must be a number.
- **Example**:
  ```graphql
  query Products($category: String!, $page: Int!) {
    products(category: $category, page: $page) {
      productList {
        id
        title
        price
        category
        initialImageUrl
        additionalImageUrl
        shortDescription
        isAvailable
        isRunningOut
        isInTheCart # indicates whether the product is the cart of the user who requested this query
        userRating # indicates the rating of the product (from 1 to 5, in increments of 0.5), can be null if there are no reviews
      }
      totalPages # indicates how many pages there are, used for pagination purposes
    }
  }
  ```
  **Result (example)**:
  ```JSON
  {
    "data": {
      "products": {
        "productList": [
          {
            "id": 159,
            "title": "Apple MacBook Pro 16\" M1 Pro 512GB 2021",
            "price": 114970,
            "category": "Ноутбуки",
            "initialImageUrl": "https://onlinestore-product-images.s3.amazonaws.com/8bd44131-8cc9-4503-9d38-a784e90220f4.png",
            "additionalImageUrl": "https://onlinestore-product-images.s3.amazonaws.com/14f5c601-96a6-41f2-a22e-9922bb207376.png",
            "shortDescription": "Екран 16.2\" Liquid Retina XDR (3456x2234) 120 Гц, глянсовий / Apple M1 Pro / RAM 16 ГБ / SSD 512 ГБ / Apple M1 Pro Graphics (16 ядер) / без ОД / Wi-Fi / Bluetooth / веб-камера / macOS Monterey / 2.1 кг / сірий",
            "isAvailable": true,
            "isRunningOut": false,
            "userRating": 4.5
          },
          {
            "id": 160,
            "title": "Ноутбук Acer Aspire 7 A715-42G-R5B1",
            "price": 36999,
            "category": "Ноутбуки",
            "initialImageUrl": "https://onlinestore-product-images.s3.amazonaws.com/255a898a-49da-4df6-88bd-0cf13a44dd2d.png",
            "additionalImageUrl": "https://onlinestore-product-images.s3.amazonaws.com/0d51e340-f487-4f58-a25e-35f977eb6098.png",
            "shortDescription": "Екран 15.6\" IPS (1920x1080) Full HD 144 Гц, матовий / AMD Ryzen 5 5500U (2.1 - 4.0 ГГц) / RAM 8 ГБ / SSD 512 ГБ / nVidia GeForce RTX 3050, 4 ГБ / без ОД / LAN / Wi-Fi / Bluetooth / веб-камера / без ОС / 2.15 кг / чорний",
            "isAvailable": true,
            "isRunningOut": true,
            "userRating": 4
          },
          {
            "id": 161,
            "title": "Ноутбук ASUS Laptop X515MA-BR874W Transparent Silver",
            "price": 14999,
            "category": "Ноутбуки",
            "initialImageUrl": "https://onlinestore-product-images.s3.amazonaws.com/f9c0b15a-2f54-49c8-a407-007c4cc1c2cc.png",
            "additionalImageUrl": "https://onlinestore-product-images.s3.amazonaws.com/67c8dc18-3347-498c-a61a-028131b2cf69.png",
            "shortDescription": "Екран 15.6\" (1366x768) WXGA HD, матовий / Intel Celeron N4020 (1.1 - 2.8 ГГц) / RAM 4 ГБ / SSD 256 ГБ / Intel UHD Graphics 600 / без ОД / Wi-Fi / Bluetooth / веб-камера / Windows 11 / 1.8 кг / сріблястий",
            "isAvailable": true,
            "isRunningOut": false,
            "userRating": 5
          }
        ],
        "totalPages": 2
      }
    }
  }
  ```
- **Error responses**:
  - The 'page' parameter is less than or equal to zero.
    ```JSON
    {
      "data": {},
      "errors": [
        {
          "message": "The 'page' parameter must be greater than zero"
        }
      ]
    }
    ```
  - The user is trying to access the 'isInTheCart' field while being unauthenticated
    ```JSON
    {
      "data": {},
      "errors": [
        {
          "message": "User must be authenticated to request the \"isInTheCart\" field"
        }
      ]
    }
    ```
  - The user specified a non-existent product category
    ```JSON
    {
      "data": {},
      "errors": [
        {
          "message": "The specified category does not exist"
        }
      ]
    }
    ```
#### 3. Get a list of products by search query
- **Who can access:** everyone (but if you request the 'isInTheCart' field, you have to provide a valid [access token](#access-token))
- **Required parameters:**
  - _searchQuery_ - the query that is used for product searching. Must be a string consisting of 1 to 1000 characters
  - _page_ - the page that the user is trying to fetch. Must be greater than 0 and must not exceed the number 2,147,483,647
- **Example**:
  ```graphql
  query SearchProducts($searchQuery: String!, $page: Int!) {
    searchProducts(searchQuery: $searchQuery, page: $page) {
      productList {
        id
        title
        price
        category
        initialImageUrl
        additionalImageUrl
        shortDescription
        isInTheCart
        isAvailable
        isRunningOut
        userRating
      }
      totalPages
    }
  }
  ```
  **Result**:
  ```JSON
  {
    "data": {
      "searchProducts": {
        "productList": [
          {
            "id": 181,
            "title": "Консоль Sony PlayStation 4 Slim 500GB Black",
            "price": 12999,
            "category": "Ігрові консолі",
            "initialImageUrl": "https://onlinestore-product-images.s3.amazonaws.com/0667d9bf-ba25-4743-ac5b-9d94a416a616.png",
            "additionalImageUrl": "https://onlinestore-product-images.s3.amazonaws.com/bcd55bb0-aa38-47af-8015-0df8375bc72c.png",
            "shortDescription": "Компактна версія ультрапопулярної ігрової консолі четвертого покоління від Sony. Консоль отримала оновлений дизайн і зменшений корпус. Начинка не зазнала змін. По суті, версія Slim є старою доброю Playstation 4 в новому вигляді.",
            "isInTheCart": true,
            "isAvailable": true,
            "isRunningOut": false,
            "userRating": 5
          },
          {
            "id": 183,
            "title": "PlayStation 5 Ultra HD Blu-ray Call of Duty: Modern Warfare III",
            "price": 25499,
            "category": "Ігрові консолі",
            "initialImageUrl": "https://onlinestore-product-images.s3.amazonaws.com/e97939e5-8a9c-4cf4-b663-f51b57622236.png",
            "additionalImageUrl": "https://onlinestore-product-images.s3.amazonaws.com/f1d27468-3f9d-4de1-9c76-2917aeef98f2.png",
            "shortDescription": "Sony PlayStation 5 – нова консоль п'ятого покоління. Значні зміни торкнулися як внутрішнього наповнення, так і дизайну загалом. Ігрова приставка отримала 8 ядерний 16 потоковий процесор на архітектурі AMD Zen 2, продуктивності якої достатньо для гри в роздільній здатності аж до 8K.",
            "isInTheCart": false,
            "isAvailable": true,
            "isRunningOut": false,
            "userRating": 4.5
          },
          {
            "id": 185,
            "title": "Sony PlayStation 5 Digital Edition 825GB White",
            "price": 28999,
            "category": "Ігрові консолі",
            "initialImageUrl": "https://onlinestore-product-images.s3.amazonaws.com/64d22b21-b6be-4038-b37c-7e5696b7bd14.png",
            "additionalImageUrl": "https://onlinestore-product-images.s3.amazonaws.com/a6a8ec93-7d54-493f-9990-eba1fd22c03f.png",
            "shortDescription": "Sony PlayStation 5 – нова консоль п'ятого покоління. Значні зміни торкнулися як внутрішнього наповнення, так і дизайну загалом. Ігрова приставка отримала 8 ядерний 16 потоковий процесор на архітектурі AMD Zen 2, продуктивності якої достатньо для гри в роздільній здатності аж до 8K.",
            "isInTheCart": false,
            "isAvailable": true,
            "isRunningOut": false,
            "userRating": 4.5
          }
        ],
        "totalPages": 1
      }
    }
  }
  ```
- **Error responses**:
  - The 'page' parameter is less than or equal to zero
    ```JSON
    {
      "data": {},
      "errors": [
        {
          "message": "The 'page' parameter must be greater than zero"
        }
      ]
    }
    ```
  - The user is trying to access the 'isInTheCart' parameter while being unauthenticated
    ```JSON
    {
      "data": {},
      "errors": [
        {
          "message": "User must be authenticated to request the \"isInTheCart\" field"
        }
      ]
    }
    ```
  - The 'searchQuery' parameter is longer than 1000 characters
    ```JSON
    {
      "data": {},
      "errors": [
        {
          "message": "the 'searchQuery' parameter must be a string containing between 1 and 1000 characters"
        }
      ]
    }
    ```
#### 4. Get featured products
- **Who can access:** everyone (but if you request the 'isInTheCart' field, you have to provide a valid access token)
- **Required parameters:** none
- **Example**:
  ```graphql
  query FeaturedProducts {
    featuredProducts {
      id
      title
      price
      category
      initialImageUrl
      additionalImageUrl
      shortDescription
      isAvailable
      isRunningOut
      isInTheCart # indicates whether the product is the cart of the user who requested this query
      userRating # returns the rating of the product in increments of 0.5, can be null if there are no reviews
    }
  }
  ```
  **Result**:
  ```JSON
  {
    "data": {
      "featuredProducts": [
        {
          "id": 1096,
          "title": "Motorola G32 6/128GB Grey",
          "price": 6999,
          "category": "Smartphones",
          "initialImageUrl": "https://onlinestore-product-images.s3.amazonaws.com/3d87fc8e-eed4-4bdd-9020-4aa99d85d244.png",
          "additionalImageUrl": "https://onlinestore-product-images.s3.amazonaws.com/f1a9e141-1b95-4519-9a5f-f67c401da8a0.png",
          "shortDescription": "An extremely cool smartphone!!!",
          "isAvailable": true,
          "isRunningOut": false,
          "isInTheCart": true,
        },
        ... (11 more products)
      ]
    }
  }
  ```
#### 5. Add a product review
- **Who can access:** only authenticated users with the provided [access token](#access-token)
- **Required parameters:**
  - _productId_ - must be a valid product ID for an existing product to which the user is adding a review
  - _reviewMessage_ - the text of the review message. Must be between 1 and 2000 characters
  - _starRating_ - specifies how many stars the user is giving to the product. Must be between 1 and 5, inclusive, in increments of 0.5
- **Example**:
  ```graphql
  mutation Mutation(
    $productId: Int!
    $reviewMessage: String!
    $starRating: Float!
  ) {
    addProductReview(
      productId: $productId
      reviewMessage: $reviewMessage
      starRating: $starRating
    ) {
      productId
      userId
    }
  }
  ```
  **Example Variables**:
  ```JSON
  {
    "productId": 643,
    "reviewMessage": "A very cool product!",
    "starRating": 5
  }
  ```
  **Result**:
  ```JSON
  {
    "data": {
      "addProductReview": {
        "productId": 643,
        "userId": 627
      }
    }
  }
  ```
- **Error responses**:
  - The user is not authenticated (the 'Authorization' header is empty or the provided access token is invalid)
    ```JSON
    {
      "data": {
        "addProductReview": null
      },
      "errors": [
        {
          "message": "User must be authenticated to perform this action"
        }
      ]
    }
    ```
  - The user is trying to add a review to a product that doesn't exist
    ```JSON
    {
      "data": {
        "addProductReview": null
      },
      "errors": [
        {
          "message": "A product with the specified id does not exist"
        }
      ]
    }
    ```
  - The user is trying to add a review twice
    ```JSON
    {
      "data": {
        "addProductReview": null
      },
      "errors": [
        {
          "message": "Only one review per user is allowed for each product"
        }
      ]
    }
    ```
  - The length of the product review is wrong
    ```JSON
    {
      "data": {
        "addProductReview": null
      },
      "errors": [
        {
          "message": "reviewMessage length must be between 1 and 2000 characters"
        }
      ]
    }
    ```
  - The star rating has a value other than (1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)
    ```JSON
    {
      "data": {
        "addProductReview": null
      },
      "errors": [
        {
          "message": "starRating must be between 1 and 5, inclusive, in increments of 0.5"
        }
      ]
    }
    ```

### Cart Endpoints
#### 1. Get the contents of your shopping cart
- **URL:** /api/user/cart
- **Method:** GET
- **Description:** returns the cart of the user who made a request to this endpoint. It returns products in the cart and the total price
- **Who can access:** only authenticated users with the provided [access token](#access-token)
- **Rate limiting:** none
- **Request body:** none
- **Request params:** none
- **Query string parameters:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200
  - **Description:** The cart has been fetched successfully
  - **Content (if there are items in the cart):**
    ```TypeScript
    {
      "products": [
        {
          "productId": 1,
          "title": "Монітор 24\" Samsung LF24T450 Black",
          "price": 4000,
          "initialImageUrl": "https://onlinestore-product-images.s3.amazonaws.com/7f5e2915-66f7-45e0-9802-775db86b86dd.png",
          "quantity": 50,
          // a cart product can be ordered if the specified quantity doesn't exceed the stock balance and if the "maxOrderQuantity" limit hashn't been exceeded
          "canBeOrdered": false
        },
        {
          "productId": 2,
          "title": "Sony PlayStation 5 Digital Edition 825GB White",
          "price": 28999,
          "initialImageUrl": "https://onlinestore-product-images.s3.amazonaws.com/64d22b21-b6be-4038-b37c-7e5696b7bd14.png",
          "quantity": 2,
          "canBeOrdered": true
        }
      ],
      // cart products that can't be ordered aren't included in the total price
      "totalPrice": 57998
    }
    ```
  - **Content (if there are no items in the cart):**
    ```JSON
    {
      "products": []
    }
    ```
- **Error responses**:
  - The access token is not specified or is invalid
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The access token is either invalid or is not provided",
          }
        ]
      }
      ```
  - The access token has expired
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The access token has expired",
          }
        ]
      }
      ```
#### 2. Get the total number of items in the cart
- **URL:** /api/user/cart/count
- **Method:** GET
- **Description:** returns the total number of items in the shopping cart of the user who made the request to this endpoint
- **Who can access:** only authenticated users with the provided [access token](#access-token)
- **Rate limiting:** none
- **Request body:** none
- **Request params:** none
- **Query string parameters:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200 OK
  - **Description:** the number of cart items has been successfully received
  - **Content (example):**
    ```JSON
    {
      "cartItemCount": 12
    }
    ```
- **Error responses**:
  - The access token is not specified or is invalid
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The access token is either invalid or is not provided",
          }
        ]
      }
      ```
  - The access token has expired
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The access token has expired",
          }
        ]
      }
      ```
#### 3. Add an item to the cart or change its quantity in the cart
- **URL:** /api/user/cart
- **Method:** PUT
- **Description:** add a new product to the cart or modify the quantity of this product if it's already in the cart
- **Who can access:** only authenticated users with the provided [access token](#access-token)
- **Rate limiting:** none
- **Request body:**
  - _productId_ - must be a number that points to an existing product
  - _quantity_ - how many products with the given ID you want to add to the cart. Must be a number that is greater than 0, and must not exceed the current stock of this product in the warehouse, and must not exceed the 'max_order_quantity' value (the maximum number of products a user can order in a single transaction)
- **Request params:** none
- **Query string parameters:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 204 No Content
  - **Description:** the product has been successfully added to the cart
  - **Content**: empty
- **Error responses**:
  - The access token is not specified or is invalid
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The access token is either invalid or is not provided",
          }
        ]
      }
      ```
  - The access token has expired
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The access token has expired",
          }
        ]
      }
      ```
  - The product id is not a number
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "productId must be a number",
            "field": "productId"
          }
        ]
      }
      ```
  - The product id points to a non-existent product
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "productId must point to a valid product",
            "field": "productId"
          }
        ]
      }
      ```
  - The provided quantity is not a number or is less than 1
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "quantity must be an integer and greater than zero",
            "field": "quantity"
          }
        ]
      }
      ```
  - There aren't enough products in stock
    - **Status code**: 409 Conflict
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "insufficient stock available for this product"
          }
        ]
      }
      ```
  - The user is trying to add more instances of the same product than allowed. In other words, the user is trying to exceed the 'maxOrderQuantity' parameter, which is specified on every product.
    - **Status code**: 409 Conflict
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "more products are added to the cart than allowed",
            "maximumAllowedProducts": 1
          }
        ]
      }
      ```
  - The user is trying to add more products to the cart than allowed. There is a limit on how many unique products a user can add to their cart. This error will be shown if a user tries to exceed this predefined value.
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "the maximum limit of cart products has been exceeded",
            "maxProductsInCart": 5
          }
        ]
      }
      ```
- **Additional Notes:**
  - Because this endpoint may return an error indicating insufficient stock for the item, it is important to keep in mind that this can be exploited by determined competitors. They may try to figure out how many items we have by making requests to add items to the cart. If they get an error, they will get a better idea of how many items we have in stock.
#### 4. Remove the specified product from the cart
- **URL:** /api/user/cart/:productId
- **Method:** DELETE
- **Description:** completely deletes a specified product from the cart
- **Who can access:** only authenticated users with the provided [access token](#access-token)
- **Rate limiting:** none
- **Request body:** empty
- **Request params:**
  - _productId_ - must be a number that points to a valid product (although if it points to a non-existent product, no error will be returned)
- **Query string parameters:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 204 No Content
  - **Description:** the item has been removed from the cart or nothing has changed because there is no item with the specified ID in the cart
  - **Content**: empty
- **Error responses**:
  - The access token is not specified or is invalid
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The access token is either invalid or is not provided",
          }
        ]
      }
      ```
  - The access token has expired
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The access token has expired",
          }
        ]
      }
      ```
  - The provided product id is not a number
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "productId must be a number",
            "field": "productId"
          }
        ]
      }
      ```
#### 5. Check if it's safe to add a product to the local cart
- **URL:** /api/user/cart/is-safe-to-add-product
- **Method:** GET
- **Description:** checks whether the product is available in the specified quantity. Useful when anonymous users try to work with their cart locally with localStorage. For example, if they try to add 5 instances of some product, the React app can initiate a request to this endpoint to check whether there are enough products in stock and whether a user can order the specified number of products. If everything is okay, the specified product is added to localStorage, otherwise the operation is aborted.
- **Who can access:** everyone
- **Rate limiting:** 1 request per second per IP address
- **Request body:** empty
- **Request params:** none
- **Query string parameters:**
  - _productId_ - must be a number and must point to an existing product
  - _quantityToAdd_ - specifies how many instances of one product the user is trying to add. Must be a positive number.
- **Required cookies:** none
- **Success responses:**
  1. There are enough products in stock and the specified quantity doesn't exceed a predetermined limit
      - **Example request:** /api/user/cart/is-safe-to-add-product?productId=155&quantityToAdd=2
      - **Status code:** 200 OK
      - **Description:** the user can add the specified product safely, because there are enough products in stock and the specified quantity doesn't exceed the 'max_order_quantity' attribute
      - **Content**:
        ```JSON
        {
          "safeToAdd": true,
          "reason": null
        }
        ```
  2. The user is trying to order more items than available in stock
      - **Example request:** /api/user/cart/is-safe-to-add-product?productId=155&quantityToAdd=23524
      - **Status code:** 200 OK
      - **Description:** the server returns that it's not recommended to add the specified product to the local cart because there aren't enough products in stock
      - **Content**:
        ```JSON
        {
          "safeToAdd": false,
          "reason": "InsufficentProductStock"
        }
        ```
  3. The user is trying to add more products than allowed (for example one user can only order 2 copies of one product at a time)
      - **Example request:** /api/user/cart/is-safe-to-add-product?productId=155&quantityToAdd=23524
      - **Status code:** 200 OK
      - **Description:** the server returns that it's not recommended to add the specified product to the local cart because there aren't enough products in stock
      - **Content**:
        ```JSON
        {
          "safeToAdd": false,
          "reason": "ExceededMaxOrderQuantity",
          "maxOrderQuantity": 2
        }
        ```
- **Error responses**:
  - The provided product id is not a number
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "productId must be a number",
            "field": "productId"
          }
        ]
      }
      ```
  - The provided quantityToAdd parameter is not a positive number or is not a number at all
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "quantityToAdd must be an integer and greater than zero",
            "field": "quantityToAdd"
          }
        ]
      }
      ```
#### 6. Synchronize the local cart with the API
- **URL:** /api/user/cart/is-safe-to-add-product
- **Method:** PUT
- **Description:** allows users to persist their local cart (stored in localStorage) to the API. Anonymous users cannot add cart products via API requests, so they need to store them in localStorage. If a user authenticates, they can send a request to this endpoint, specifying their local cart data, which will then be saved in the database. However, it's important to note that the API will only add products that do not exceed their quantityInStock and maxOrderQuantity attributes. Any other products will be ignored. Additionally, there is a limitation: each user can only add a predetermined number of products. This limit is determined by the API's environment variable process.env.MAX_PRODUCTS_IN_CART. If a user tries to exceed this environment variable, an error will be returned, and the entire request will have no effect.
- **Who can access:** only authenticated users with the provided [access token](#access-token)
- **Rate limiting:** 1 request per 5 seconds per IP address
- **Request body (the whole body must be an array):**
  ```TypeScript
  {
    productId: number;
    quantity: number;
  }[]
  ```
  - _productId_ - must be an integer that is greater than zero
  - _quantity_ - must be an integer that is greater than zero
- **Request params:** none
- **Query string parameters:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 204 No Content
  - **Description**: the server understood the request and took action, either adding the specified products or not. This endpoint intentionally avoids providing clear responses to prevent users from attempting to discern inventory levels and potential limitations by sending large batches of products. The primary use of this endpoint is intended for the React app to operate seamlessly in the background, synchronizing local cart data with the API after user authentication. End-users will remain unaware of this endpoint.
  - **Content**: empty
- **Error responses**:
  - The access token is not specified or is invalid
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The access token is either invalid or is not provided",
          }
        ]
      }
      ```
  - The access token has expired
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The access token has expired",
          }
        ]
      }
      ```
  - The request body is not an array
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "request body must be an array",
            "field": ""
          }
        ]
      }
      ```
  - At least one "productId" parameter wasn't provided or it's not a number that is greater than zero
    - **Status code**: 422 Unprocessable Entity
    - **Content (example)**:
      ```JSON
      {
        "errors": [
          {
            "message": "each productId must be an integer that is greater than zero",
            "field": "[0].productId"
          }
        ]
      }
      ```
  - At least one "quantity" parameter wasn't provided or it's not a number that is greater than zero
    - **Status code**: 422 Unprocessable Entity
    - **Content (example)**:
      ```JSON
      {
        "errors": [
          {
            "message": "each quantity must be an integer that is greater than zero",
            "field": "[0].quantity"
          }
        ]
      }
      ```
  - The user is trying to add multiple products with the same productId
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "request body must not contain duplicate product IDs",
            "field": ""
          }
        ]
      }
      ```
#### 7. Get the maximum number of items that a user is allowed to have in the cart
- **URL:** /api/user/cart/maximum-items
- **Method:** GET
- **Description:** retrieves the maximum allowed number of products per user in the cart. This endpoint is essential for the frontend application to enable a feature for managing the local cart. Anonymous users cannot send API requests to manipulate the cart, so the React app stores cart products in localStorage. It's important to limit the number of products in the local cart to prevent synchronization issues when a user logs in. Exceeding this limit could result in a failed HTTP request during the synchronization process, which is designed to synchronize the local cart with the API.
- **Who can access:** everyone
- **Rate limiting:** none
- **Request body:** none
- **Request params:** none
- **Query string parameters:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200 OK
  - **Description**: the server has returned the result successfully
  - **Content**:
      ```TypeScript
      {
        "maxProductsInCart": number
      }
      ```
- **Error responses**: none

### Shipping Endpoints
#### 1. Get a list of supported cities for shipping
- **URL:** /api/shipping/supported-cities
- **Method:** GET
- **Description:** returns a list of cities that are supported for delivery within the application
- **Who can access:** everyone
- **Rate limiting:** none
- **Request body:** none
- **Request params:** none
- **Query string parameters:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200
  - **Description:** the list of cities has been returned successfully
  - **Content (example):**
    ```JSON
    {
      "supportedCities": ["Київ"]
    }
    ```
- **Error responses**: none
#### 2. Get all Nova Poshta branches (відділення) and pickup points (пункти)
- **URL:** /api/shipping/nova-poshta/warehouses
- **Method:** GET
- **Description:** returns all available Nova Poshta branches and pickup points. This endpoint is used by the React application to display all places where the order can be shipped to.
- **Who can access:** everyone
- **Rate limiting:** none
- **Request body:** none
- **Request params:** none
- **Query string parameters:**
  - _city_ - specifies the city for which you want to retrieve Nova Poshta branches and pickup points. It must be specified as a string and be supported by the API.
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200
  - **Description:** the Nova Poshta branches and pickup points were returned successfully
  - **Content:**
    ```TypeScript
    {
      "warehouses": [
        "Відділення №1: вул. Пирогівський шлях, 135",
        "Відділення №2: вул. Богатирська, 11",
        "Відділення №3 (до 30 кг на одне місце): вул. Слобожанська,13",
        "Відділення №4: (до 200 кг) вул. Верховинна, 69",
        "Відділення №5: вул. Федорова, 32 (м. Олімпійська)",
        "Відділення №6: вул. Миколи Василенка, 2",
        "Відділення №7 (до 10 кг): вул. Гната Хоткевича, 8 (м.Чернігівська)",
        "Відділення №8 (до 30 кг на одне місце): вул. Набережно-Хрещатицька, 33",
        "Відділення №9: пров. В'ячеслава Чорновола, 54а (р-н Жулянського мосту)",
        "Відділення №10 (до 30 кг на одне місце): вул. Василя Жуковського, 22А",
        "Відділення №12: вул. Якутська, 8",
        // ...
      ]
    }
    ```
- **Error responses**:
  - The 'city' parameter doesn't exist
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "the field 'city' must be specified",
            "field": "city"
          }
        ]
      }
      ```
  - The specified 'city' parameter isn't supported
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "the provided city is not supported",
            "field": "city"
          }
        ]
      }
      ```

### User Endpoints
#### 1. Get the profile of the user who makes the request
- **URL:** /api/user/profile
- **Method:** GET
- **Description:** retrieves the first name and last name of the requester.
- **Who can access:** only authenticated users with the provided [access token](#access-token)
- **Rate limiting:** none
- **Request body:** none
- **Request params:** none
- **Query string parameters:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200
  - **Description:** the first name and last name were returned successfully
  - **Content**
    ```JSON
    {
      "firstName": "Oleksii",
      "lastName": "Potapchuk"
    }
    ```
- **Error responses**: none

### Order Endpoints
#### 1. Check order feasibility
- **URL:** /api/user/order/check-feasibility
- **Method:** POST
- **Description:** checks if it's possible to order the provided products. The user gives a list of product IDs along with the quantities they want to order, and the server returns whether the provided products can be ordered in the provided quantities or not.
- **Who can access:** everyone
- **Rate limiting:** none
- **Request body (the whole body must be an array):**
  ```TypeScript
  {
    productId: number;
    quantity: number;
  }[]
  ```
  - _productId_ - must be an integer that is greater than zero
  - _quantity_ - must be an integer that is greater than zero
- **Request params:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200
  - **Description:** the check has been performed successfully
  - **Content:**
    ```TypeScript
    {
      // productId: { canBeOrdered: boolean }
      "1261": {
        "canBeOrdered": true
      },
      "1262": {
        "canBeOrdered": false
      },
      "1263": {
        "canBeOrdered": false
      },
      "1264": {
        "canBeOrdered": false
      },
      "1265": {
        "canBeOrdered": true
      }
    }
    ```
- **Error responses**:
  - The request body isn't provided or it's not a non-empty array
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "request body must be a non-empty array",
            "field": ""
          }
        ]
      }
      ```
  - The specified 'productId' parameter is not a number
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "each productId must be an integer that is greater than zero",
            "field": "[0].productId"
          }
        ]
      }
  - The specified 'quantity' parameter is not a number
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "each quantity must be an integer that is greater than zero",
            "field": "[0].quantity"
          }
        ]
      }
  - The user is trying to check more products at a time than allowed (determined by the process.env.MAX_PRODUCTS_IN_CART variable)
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "only a limited number of products can be checked at once",
            "maxAllowedProducts": 5
          }
        ]
      }
  - Some of the provided product identifiers are duplicated
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "request body must not contain duplicate product IDs",
            "field": "req.body"
          }
        ]
      }
  - At least one of the provided products doesn't exist
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
              "message": "some of the provided product IDs don't exist"
          }
        ]
      }
#### 2. Get order recipients associated with a single user
- **URL:** /api/user/order/recipients
- **Method:** GET
- **Description:** This endpoint retrieves a list of recipients associated with a specific user. Recipients are individuals designated by the user to receive goods or services for orders they've placed.
- **Who can access:** only authenticated users with the provided [access token](#access-token)
- **Rate limiting:** none
- **Request body:** none
- **Request params:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200
  - **Description:** the order recipients have been fetched successfully
  - **Content:**
    ```JSON
    {
      "orderRecipients": [
        {
          "firstName": "Oleksii",
          "lastName": "Potapchuk",
          "phoneNumber": "+380-12-345-67-89"
        },
        {
          "firstName": "Ivan",
          "lastName": "Sirko",
          "phoneNumber": "+380-22-345-67-89"
        }
      ]
    }
    ```
- **Error responses**:
  - The access token is not specified or is invalid
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The access token is either invalid or is not provided"
          }
        ]
      }
      ```
  - The access token has expired
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The access token has expired"
          }
        ]
      }
      ```
#### 3. Create a new order
- **URL:** /api/user/order
- **Method:** POST
- **Description:** creates a new order. If any products exceed the available stock or the 'max_order_quantity' limit, those products will not be included in the order. However, at least one product must be available for ordering. If the request comes from an anonymous user, a unique email must be provided. In this scenario, the API will generate a new account and send the password to the provided email address. For orders with the payment method "Оплатити зараз" (Pay Now), the order confirmation email will be dispatched only after the online payment is completed. Conversely, if the payment method is "Оплата при отриманні товару" (Payment on Delivery), a notification will be sent to the admin via the Telegram bot indicating the creation of a new order. In all other cases, the admin will receive a notification only after the online payment is completed.
- **Who can access:** everyone
- **Rate limiting:** none
- **Request body:**
  - _phoneNumber_ - specifies the phone number of the order recipient. Must be specified and must be a valid Ukrainian number. Must adhere to either one of these formats: +380123456789 or +380-12-345-67-89
  - _firstName_ - specifies the first name of the recipient. Must be specified and must not exceed 50 characters
  - _lastName_ - specifies the last name of the recipient. Must be specified and must not exceed 50 characters
  - _email_ - must only be specified if the user is NOT authenticated, otherwise this parameter will be ignored. If specified, it must be a valid email and must be unique across the application (no two users can have the same email)
  - _paymentMethod_ - must be specified and must be a valid payment method. Please refer to the 'order_payment_methods' DB table for a list of available payment methods
  - _city_ - must be specified and must be a valid Ukrainian city. Please refer to the 'cities' DB table for a list of available cities
  - _deliveryWarehouse_ - must be specified and must point to an existing branch or pickup point of the selected postal service. Please refer to the 'postal_service_warehouses' DB table ('warehouse_description' column) for a list of available warehouses
  - _orderProducts_ - this parameter should only be provided if the user is NOT authenticated, otherwise it will be ignored. If included, it must follow this format: "{ productId: number; quantity: number }[]". In this format, "productId" indicates the ID of the product the user wants to order, and "quantity" specifies how many instances of this product the user wants to order. Ensure that all specified product IDs are valid and correspond to existing products. Additionally, make sure that at least one provided product does not exceed the available stock. Furthermore, each product has a "max_order_quantity" limit, which specifies the maximum number of instances of the same product a user is allowed to order in a single transaction. Make sure that as least one provided product doesn't exceed this limit. All products that exceed the available stock or the 'max_order_quantity' limit will be ignored.
- **Request params:** none
- **Required cookies:** none
- **Success responses:**
  - **Example 1 (the payment method is "Оплатити зараз" (Pay now), so the API returns a link to the payment service):**
    - **Status code:** 200
    - **Description:** the order has been created successfully. The client application must use the provided signature and data to redirect the user to the LiqPay payment page (https://www.liqpay.ua/documentation/data_signature)
    - **Content (example):**
      ```JSON
      {
        "data": "eyJ2ZXJzaW9uIjozLCJwdWJsaWNfa2V5Ijoic2FuZGJveF9pNzM5NDQ3MzE5MDYiLCJhY3Rpb24iOiJwYXkiLCJhbW91bnQiOiIyNTQ5OS4wMCIsImN1cnJlbmN5IjoiVUFIIiwiZGVzY3JpcHRpb24iOiLQntC/0LvQsNGC0LAg0LfQsNC80L7QstC70LXQvdC90Y8g4oSWNDEg0LrQvtGA0LjRgdGC0YPQstCw0YfQtdC8INC3IElEIDIwNjNcbtCe0YLRgNC40LzRg9Cy0LDRhzogT2xla3NpaSBQb3RhcGNodWsiLCJvcmRlcl9pZCI6NDEsInJlc3VsdF91cmwiOiJodHRwOi8vbG9jYWxob3N0L3VzZXIvb3JkZXIvY2FsbGJhY2sifQ==",
        "signature": "/R/bN+xDur7hbGo5Ebfca6jyA58="
      }
      ```
  - **Example 2 (the payment method is "Оплата при отриманні товару" (Payment on Delivery), so the API returns the order id):**
    - **Status code:** 200
    - **Description:** the order has been created successfully.
    - **Content (example):**
      ```JSON
      {
        "orderId": "d3a969f2-2613-43ed-bf3e-a4d1bb2125b6"
      }
      ```
- **Error responses**:
  - The parameter requirements were not met (please check the requirements above)
    - **Status code**: 422 Unprocessable Entity
    - **Content (example)**:
      ```JSON
      {
        "errors": [
          {
            "message": "the field \"lastName\" must be 1 to 50 characters long",
            "field": "lastName"
          }
        ]
      }
  - The user is trying to create a new order, and all products are either out of stock or surpass the 'max_order_quantity' limit (applicable to both anonymous and authenticated users)
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
              "message": "order cannot be placed for any products because they are either out of stock or surpass the maximum order quantity"
          }
        ]
      }
      ```
  - The authenticated user does not have any products in the cart
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
              "message": "order cannot be placed because the cart is empty"
          }
        ]
      }
      ```
  - The anonymous user is trying to create an order with an email that is already in use
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The email is already taken",
            "field": "email"
          }
        ]
      }
      ```
  - The specified NovaPoshta branch or pickup point does not exist in the specified city
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "the specified warehouse doesn't exist in the provided city",
            "field": "deliveryWarehouse"
          }
        ]
      }
      ```
  - The specified payment method is not supported
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "the field \"paymentMethod\" has an unsupported value",
            "field": "paymentMethod"
          }
        ]
      }
  - The anonymous user has provided too many unique products
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```TypeScript
      {
        "errors": [
          {
            "message": "only 5 products can be ordered per one order", // the exact number may vary depending on the server configuration
            "field": "orderProducts"
          }
        ]
      }
  - The anonymous user has provided duplicate product IDs
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "orderProducts must not contain duplicate product IDs",
            "field": "orderProducts"
          }
        ]
      }
  - The anonymous user provided products that do not exist
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "some of the provided products do not exist",
            "field": "orderProducts"
          }
        ]
      }
#### 4. Process a payment (LiqPay callback)
- **URL:** /api/user/order/callback
- **Method:** POST
- **Description:** after a user completes payment for their order, they will be redirected to this endpoint. Here, the system will confirm that the request originated from LiqPay and then mark the order as paid. Subsequently, an email notification will be sent to the associated email address confirming payment and informing the user that managers will reach out soon to confirm the order. Additionally, an alert will be sent to the admin via Telegram to notify them of the new order.
- **Who can access:** everyone
- **Rate limiting:** none
- **Request body:**
  - _data_ - must be a string encoded in base64 and should include parameters as specified on this page: [LiqPay API Callback Documentation](https://www.liqpay.ua/documentation/api/callback).
  - _signature_ - must be a string generated in the following manner: base64_encode( sha1( liqpay_private_key + data + liqpay_private_key) ). This parameter serves the purpose of ensuring that the request originates from LiqPay and not from any other source.
- **Request params:** none
- **Required cookies:** none
- **Success responses:**
  - **Example 1 (the payment was successful, so LiqPay sent a successful response):**
    - **Status code:** 302
    - **Description:** the order has been marked as paid, so a redirect takes place to the React app to this URL: "/user/order/callback?res=eyJzdGF0dXMiOiJzdWNjZXNzIn0=". The 'res' parameter is used to transfer base64 encoded data indicating that the payment was successful. The base64 decoded data will look like this: '{"status":"success"}'
  - **Example 2 (the order has already been paid for):**
    - **Status code:** 302
    - **Description:** the order has already been marked as paid in the past, so a redirect takes place to the React app to this URL: "/user/order/callback?res=eyJzdGF0dXMiOiJhbHJlYWR5IHBhaWQifQ==". The 'res' parameter is used to transfer base64 encoded data indicating that the order has already been paid for. The base64 decoded data will look like this: '{"status":"already paid"}'
  - **Example 3 (the payment was cancelled):**
    - **Status code:** 302
    - **Description:** the payment was cancelled, so a redirect takes place to the React app to this URL: "/user/order/callback?res=eyJzdGF0dXMiOiJjYW5jZWwifQ==". The 'res' parameter is used to transfer base64 encoded data indicating that the payment was cancelled. The base64 decoded data will look like this: '{"status":"cancel"}'
  - **Example 4 (the payment failed):**
    - **Status code:** 302
    - **Description:** the payment failed, so a redirect takes place to the React app to this URL: "/user/order/callback?res=eyJzdGF0dXMiOiJmYWlsdXJlIn0=". The 'res' parameter is used to transfer base64 encoded data indicating that the payment failed. The base64 decoded data will look like this: '{"status":"failure"}'
- **Error responses**:
  - The parameter requirements were not met (please check the requirements above)
    - **Status code**: 422 Unprocessable Entity
    - **Content (example)**:
      ```JSON
      {
        "errors": [
          {
            "message": "the field \"data\" must contain a JSON object encoded in base64",
            "field": "data"
          }
        ]
      }
  - The provided signature is invalid
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "the provided signature is invalid",
            "field": "signature"
          }
        ]
      }
      ```
#### 5. Get a list of orders
- **URL:** /api/user/orders
- **Method:** GET
- **Description:** retrieves a list of orders associated with the current user
- **Who can access:** only authenticated users with the provided [access token](#access-token)
- **Rate limiting:** none
- **Request body:** none
- **Request params:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200 OK
  - **Description:** the list of orders has been retrieved successfully
  - **Content (example):**
    ```JSON
    {
      "orders": [
        {
          "orderId": "b22a5678-b8c9-4a96-b589-ced18c362635",
          "previewURL": "https://onlinestore-product-images.s3.amazonaws.com/c7d3bf2a-8a81-4201-81ed-f20cb7912ac8.png",
          "paymentMethod": "Оплата при отриманні товару",
          "totalPrice": 31499,
          "isPaid": false,
          "deliveryPostalService": {
            "name": "Нова Пошта",
            "warehouseDescription": "Відділення №6: вул. Миколи Василенка, 2"
          },
          "recipient": {
            "firstName": "Єлизавета",
            "lastName": "Прокопенко",
            "phoneNumber": "+380-23-456-78-90"
          },
          "creationTime": "03.04.2024",
          "statusChangeHistory": [
            {
              "orderStatus": "Замовлення оброблюється",
              "statusChangeTime": "03.04.2024 06:27"
            }
          ]
        },
        {
          "orderId": "51a36ccd-1ab2-4308-8f11-b8e8a4816a72",
          "previewURL": "https://onlinestore-product-images.s3.amazonaws.com/55b36dd7-30d7-48d3-808c-f8becc060917.png",
          "paymentMethod": "Оплатити зараз",
          "totalPrice": 971085,
          "isPaid": true,
          "deliveryPostalService": {
            "name": "Нова Пошта",
            "warehouseDescription": "Відділення №68 (до 30 кг): вул. Миколайчука, 8"
          },
          "recipient": {
            "firstName": "Сергій",
            "lastName": "Ткаченко",
            "phoneNumber": "+380-12-345-67-89"
          },
          "creationTime": "03.03.2024",
          "statusChangeHistory": [
              {
                "orderStatus": "Замовлення оброблюється",
                "statusChangeTime": "03.03.2024 06:15"
              },
              {
                "orderStatus": "Замовлення очікує відправлення",
                "statusChangeTime": "03.03.2024 12:53"
              },
              {
                "orderStatus": "Замовлення відправлене",
                "statusChangeTime": "03.03.2024 13:49"
              },
              {
                "orderStatus": "Замовлення чекає у поштовому відділенні",
                "statusChangeTime": "04.03.2024 09:23"
              },
              {
                "orderStatus": "Замовлення виконане",
                "statusChangeTime": "04.03.2024 15:57"
              }
          ]
        }
      ]
    }
    ```
- **Error responses**:
  - The access token is not specified or is invalid
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The access token is either invalid or is not provided",
          }
        ]
      }
      ```
  - The access token has expired
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The access token has expired",
          }
        ]
      }
      ```

### Warranty Request Endpoints
#### 1. Get a list of warranty requests for the current user
- **URL:** /api/user/warranty-requests
- **Method:** GET
- **Description:** returns a list of warranty requests that are associated with the user who made the request. A warranty request is basically a formal way of asking a manufacturer or seller to fix or replace something that's gone wrong with a product you bought, because it's still under warranty.
- **Who can access:** only authenticated users with the provided [access token](#access-token)
- **Rate limiting:** none
- **Request body:** none
- **Request params:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200
  - **Description:** the warranty requests have been fetched successfully
  - **Content (example):**
    ```JSON
    {
      "warrantyRequests": [
        {
          "id": 3,
          "issueDescription": "Неправильно працюючі датчики",
          "serviceCenter": "Сервісний центр №3 (вул. Героїв Незалежності, 16, Житомир, 03003)",
          "userDataRequestInitiator": {
            "firstName": "Олексій",
            "lastName": "Потапчук",
            "email": "lyoshachuk@gmail.com"
          },
          "repairingProductData": {
            "title": "Квадрокоптер DJI Mini 4 Pro with RC-N2 Remote Controller",
            "reviewURL": "https://onlinestore-product-images.s3.amazonaws.com/cff1d10c-f5d5-4907-8b13-8d89dafb648d.png"
          },
          "statusHistory": [
            {
              "statusChangeTime": "14.04.2024 15:48",
              "status": "Йдуть ремонтні роботи"
            },
            {
              "statusChangeTime": "14.04.2024 11:07",
              "status": "Сервісний центр оцінює стан товару"
            },
            {
              "statusChangeTime": "14.04.2024 06:34",
              "status": "Товар зданий у сервіс"
            }
          ]
        },
        {
          "id": 2,
          "issueDescription": "Непрацюючі динаміки",
          "serviceCenter": "Сервісний центр №2 (вул. Дегтярівська, 32, Львів, 02002)",
          "userDataRequestInitiator": {
            "firstName": "Oleksii",
            "lastName": "Potapchuk",
            "email": "lyoshachuk@gmail.com"
          },
          "repairingProductData": {
            "title": "Apple MacBook Pro 16\" M1 Pro 512GB 2021",
            "reviewURL": "https://onlinestore-product-images.s3.amazonaws.com/8bd44131-8cc9-4503-9d38-a784e90220f4.png"
          },
          "statusHistory": [
            {
              "statusChangeTime": "20.03.2024 16:52",
              "status": "Товар був успішно отриманий"
            },
            {
              "statusChangeTime": "20.03.2024 11:48",
              "status": "Не було знайдено жодних дефектів; товар очікує клієнта в сервісному центрі"
            },
            {
              "statusChangeTime": "20.03.2024 08:07",
              "status": "Сервісний центр оцінює стан товару"
            },
            {
              "statusChangeTime": "20.03.2024 07:34",
              "status": "Товар зданий у сервіс"
            }
          ]
        }
      ]
    }
    ```
- **Error responses**:
  - The access token is not specified or is invalid
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The access token is either invalid or is not provided",
          }
        ]
      }
      ```
  - The access token has expired
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The access token has expired",
          }
        ]
      }
      ```

### Fundraising Campaign Endpoints
#### 1. Get a list of fundraising campaigns
- **URL:** /api/fundraising-campaigns
- **Method:** GET
- **Description:** returns a list of fundraising campaigns based on the provided status.
- **Who can access:** everyone
- **Rate limiting:** none
- **Request body:** none
- **Request params:** none
- **Query string parameters:**
  - _status_ - specifies the status that fundraising campaigns must have. Can be either 'ongoing' (active campaigns that are currently accepting donations) and 'finished' (finished campaigns that are no longer accepting donations).
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200
  - **Description:** the fundraising campaigns have been fetched successfully
  - **Content (example):**
    ```TypeScript
    {
      "fundraisingCampaigns": [
        {
          "id": 2,
          "title": "Збір на дрони для 54 окремої механізованої бригади",
          "financialObjective": 295000,
          "previewUrl": "https://onlinestore-product-images.s3.eu-north-1.amazonaws.com/255db5b8-6df6-404f-8a3d-6eeabab4e975.png",
          "raisedMoney": 150739,
          // "fundingProgressPercentage" represents the progress made towards the fundraising goal in terms of a percentage
          "fundingProgressPercentage": 51.1
        },
        {
          "id": 3,
          "title": "Збір на дрони для 23 окремої механізованої бригади",
          "financialObjective": 400000,
          "previewUrl": "https://onlinestore-product-images.s3.eu-north-1.amazonaws.com/25139a87-3d4e-4d70-9677-c6353f9d6b1f.png",
          "raisedMoney": 241267,
          "fundingProgressPercentage": 60.32
        }
      ]
    }
    ```
- **Error responses**:
  - The 'status' query string parameter doesn't meet the requirements
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "status must be either \"ongoing\" or \"finished\"",
            "field": "status"
          }
        ]
      }
      ```
#### 2. Create a new pending transaction
- **URL:** /api/fundraising-campaigns/pending-transactions
- **Method:** POST
- **Description:** creates a new pending transaction for a fundraising campaign. A pending transaction is a transaction that hasn't been paid for yet. Returns 'data' and 'signature' parameters, which are to be used for redirecting a user to the LiqPay payment page.
- **Who can access:** only authenticated users with the provided [access token](#access-token)
- **Rate limiting:** none
- **Request body:**
  - _campaignId_: ID of the campaign that the user wants to donate to. Must point to an existing fundraising campaign.
  - _donationAmount_: how much money the user wants to donate. Must be a number and be at least 100.
- **Request params:** none
- **Query string parameters:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 201 Created
  - **Description:** the pending transaction has been created successfully
  - **Content (example):**
    ```JSON
    {
        "data": "eyJ2ZXJzaW9uIjozLCJwdWJsaWNfa2V5Ijoic2FuZGJveF9pNTIxNzAwNzc5MjkiLCJhY3Rpb24iOiJwYXlkb25hdGUiLCJhbW91bnQiOiIxMDAuMDAiLCJjdXJyZW5jeSI6IlVBSCIsImRlc2NyaXB0aW9uIjoi0J/QvtC20LXRgNGC0LLRg9Cy0LDQvdC90Y8g0LrQvtGI0YLRltCyINC90LAg0LfQsdGW0YAg4oSWMSDQutC+0YDQuNGB0YLRg9Cy0LDRh9C10Lwg0LcgSUQgMSIsIm9yZGVyX2lkIjoxMiwicmVzdWx0X3VybCI6Imh0dHA6Ly9sb2NhbGhvc3QvYXBpL2Z1bmRyYWlzaW5nLWNhbXBhaWduL2NhbGxiYWNrIn0=",
        "signature": "xc6arufajfplwFlBrC/x/lrfS4Q="
    }
    ```
- **Error responses**:
  - The access token is not specified or is invalid
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The access token is either invalid or is not provided",
          }
        ]
      }
      ```
  - The access token has expired
    - **Status code**: 401 Unauthorized
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The access token has expired",
          }
        ]
      }
      ```
  - The campaignId field is not a number or it points to a non-existent fundraising campaign
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "campaignId must be a number pointing at an existing fundraising campaign",
            "field": "campaignId"
          }
        ]
      }
      ```
  - The donationAmount parameter is not a number or it is less than 100
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "donationAmount must be a number that is greater than 100",
            "field": "donationAmount"
          }
        ]
      }
      ```
  - The fundraising campaign is no longer accepting donations as it has been completed
    - **Status code**: 409 Conflict
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "The fundraising campaign has already reached its goal and is now closed for further donations."
          }
        ]
      }
      ```
#### 3. Process a donation (LiqPay callback)
- **URL:** /api/fundraising-campaign/callback
- **Method:** POST
- **Description:** after a user completes payment for their donation, they will be redirected to this endpoint. Here, the system will confirm that the request originated from LiqPay and then mark the previously created fundraising transaction as paid.
- **Who can access:** everyone
- **Rate limiting:** none
- **Request body:**
  - _data_ - must be a string encoded in base64 and should include parameters as specified on this page: [LiqPay API Callback Documentation](https://www.liqpay.ua/documentation/api/callback).
  - _signature_ - must be a string generated in the following manner: base64_encode( sha1( liqpay_private_key + data + liqpay_private_key) ). This parameter serves the purpose of ensuring that the request originates from LiqPay and not from any other source.
- **Request params:** none
- **Required cookies:** none
- **Success responses:**
  - **Example 1 (the payment was successful, so LiqPay sent a successful response):**
    - **Status code:** 302
    - **Description:** the fundraising transaction has been marked as paid, so a redirect takes place to the React app to this URL: "/fundraising-campaign/callback?res=eyJzdGF0dXMiOiJzdWNjZXNzIn0=". The 'res' query parameter is used to transfer base64 encoded data indicating that the payment was successful. The base64 decoded data will look like this: '{"status":"success"}'
  - **Example 2 (the fundraising transaction has already been paid for):**
    - **Status code:** 302
    - **Description:** the fundraising transaction has already been marked as paid in the past, so a redirect takes place to the React app to this URL: "/fundraising-campaign/callback?res=eyJzdGF0dXMiOiJhbHJlYWR5IHBhaWQifQ==". The 'res' query parameter is used to transfer base64 encoded data indicating that the fundraising transaction has already been paid for. The base64 decoded data will look like this: '{"status":"already paid"}'
  - **Example 3 (the payment was cancelled):**
    - **Status code:** 302
    - **Description:** the payment was cancelled, so a redirect takes place to the React app to this URL: "/fundraising-campaign/callback?res=eyJzdGF0dXMiOiJjYW5jZWwifQ==". The 'res' query parameter is used to transfer base64 encoded data indicating that the payment was cancelled. The base64 decoded data will look like this: '{"status":"cancel"}'
  - **Example 4 (the payment failed):**
    - **Status code:** 302
    - **Description:** the payment failed, so a redirect takes place to the React app to this URL: "/fundraising-campaign/callback?res=eyJzdGF0dXMiOiJmYWlsdXJlIn0=". The 'res' query parameter is used to transfer base64 encoded data indicating that the payment failed. The base64 decoded data will look like this: '{"status":"failure"}'
- **Error responses**:
  - The parameter requirements were not met (please check the requirements above)
    - **Status code**: 422 Unprocessable Entity
    - **Content (example)**:
      ```JSON
      {
        "errors": [
          {
            "message": "the field \"data\" must contain a JSON object encoded in base64",
            "field": "data"
          }
        ]
      }
  - The provided signature is invalid
    - **Status code**: 422 Unprocessable Entity
    - **Content**:
      ```JSON
      {
        "errors": [
          {
            "message": "the provided signature is invalid",
            "field": "signature"
          }
        ]
      }
      ```

### Health Endpoints
#### 1. Health check
- **URL:** /api/health
- **Method:** GET
- **Description:** returns the status indicating that the application is working properly. Useful for load balancers and other applications that rely of health checks.
- **Who can access:** everyone
- **Rate limiting:** none
- **Request body:** none
- **Request params:** none
- **Query string parameters:** none
- **Required cookies:** none
- **Success response:**
  - **Status code:** 200
  - **Description:** the application is working correctly
  - **Content:**
    ```JSON
    {
      "status": "healthy"
    }
    ```
- **Error responses**: none
