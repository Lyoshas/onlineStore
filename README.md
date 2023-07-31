
## Table of Contents
- [Table of Contents](#table-of-contents)
- [Prerequisites](#prerequisites)
- [Starting the project up](#starting-the-project-up)
- [Terminology](#terminology)
    - [Access Token](#access-token)
    - [Refresh Token](#refresh-token)
- [API Documentation](#api-documentation)
  - [Base URL](#base-url)
  - [Authentication Note](#authentication-note)
  - [Authentication Endpoints](#authentication-endpoints)
    - [Endpoint #1. Sign In](#endpoint-1-sign-in)
    - [Endpoint #2. Request a new access token](#endpoint-2-request-a-new-access-token)
    - [Endpoint #3. Sign Up](#endpoint-3-sign-up)
    - [Endpoint #4. Checking email availability](#endpoint-4-checking-email-availability)

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

Include the refresh token in the request to obtain a new access token (more about this endpoint later)

## API Documentation
### Base URL
The base URL for all API endpoints is: **http://localhost**

### Authentication Note
Some API endpoints require authentication using access tokens and refresh tokens.

### Authentication Endpoints
#### Endpoint #1. Sign In
- **URL:** /api/auth/sign-in
- **Method:** POST
- **Description:** signs the user in. The user's account must be activated before signing in.
- **Rate Limiting:** none
- **Request Body:**
  - _login_ - must be specified and must be a string.
  - _password_ - must be specified and must be a string.
  - _recaptchaToken_ - retrieved when the user completes the ReCAPTCHA v2 challenge. Must be specified and must be valid.
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
    ```JSON
    {
      // this cookie is only attached in the '/api/auth' path
      path: '/api/auth',
      // this cookie is not accessible from browser JS
      httpOnly: true,
      // the cookie will only be sent in requests originating from the same site as the one that set the cookie
      sameSite: 'strict',
    }
- **Error Responses**:
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
      |
      ```
#### Endpoint #2. Request a new access token
- **URL:** /api/auth/refresh
- **Method:** GET
- **Description:** refreshes the access token by utilizing a refresh token as a cookie.
- **Rate Limiting:** none
- **Request Body:** empty
- **Required Cookies:** a valid 'refreshToken' must be must be specified as a cookie
- **Success response:**
  - **Status code:** 200 OK
  - **Description:** the refresh token is correct, so the renewed access token is provided in the response
  - **Content:**
    ```JSON
    {
        "accessToken": "new_JWT_value"
    }
    ```
- **Error Responses**:
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
- **Rate Limiting:** none
- **Request Body:**
  - _firstName_ - must be a string and must be 1 to 50 characters long
  - _lastName_ - must be a string and must be 1 to 50 characters long
  - _email_ - must be a valid email with up to 254 characters. This email must be unique, meaning no two users can have the same email.
  - _password_ - must consist of at least 8 characters, not exceeding 72 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character
  - _phoneNumber_ - optional parameter. If specified, it must be a string that conforms to this schema: '+380-XX-XXX-XX-XX' (e.g. +380-12-345-67-89). The phone number must be unique.
  - _recaptchaToken_ - retrieved when the user completes the ReCAPTCHA v2 challenge. Must be specified and must be valid.
- **Success response:**
  - **Status code:** 201 Created
  - **Description:** The user has signed up successfully. The activation link has been sent to the specified email.
  - **Content:**
    ```JSON
    {
      "msg": "A new account has been created. Email confirmation is required.",
    }
    ```
- **Error Responses**:
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
- **Rate Limiting:** 1 request per second per IP address
- **Request Body:** empty
- **Query string parameters:**
  - email - the email you are trying to check (e.g. ?email=test@test.com). Must be a valid email.
- **Success response:**
  - **Status code:** 200 OK
  - **Description:** The request didn't cause any errors.
  - **Content:**
    ```JSON
    {
      "isEmailAvailable": true | false
    }
    ```
- **Error Responses**:
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
  