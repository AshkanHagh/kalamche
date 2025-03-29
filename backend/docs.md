# API Documentation

## Base URL

`http://localhost:7319`

---

## `GET /auth/oauth`

#### Query Parameters

```typescript
type QueryParams = {
  provider: string;
};
```

#### Headers

- Content-Type: application/json

#### Response

```typescript
interface ResourceResponse {
  success: boolean;
  url: string;
}
```

---

## `GET /auth/oauth/callback`

#### Query Parameters

```typescript
type QueryParams = {
  state: string;
  code: string;
  provider: string;
};
```

#### Headers

- Content-Type: application/json

#### Response

```typescript
interface ResourceResponse {
  success: boolean;
  accessToken: string;
  user: UserRecord;
}
```

---

## `GET /auth/token/refresh`

#### Headers

- Content-Type: application/json
- Cookie: refresh token

#### Response

```typescript
interface ResourceResponse {
  success: boolean;
  accessToken: string;
}
```

---

## `POST /auth/signup`

#### Request Body

```typescript
interface CreateResourceRequest {
  email: string;
  password: string;
}
```

#### Headers

- Content-Type: application/json

#### Response

```typescript
interface CreateResourceResponse {
  success: boolean;
  verificationToken: string;
}
```

---

## `POST /auth/email/verify`

#### Request Body

```typescript
interface CreateResourceRequest {
  token: string;
  code: string;
}
```

#### Headers

- Content-Type: application/json

#### Response

```typescript
interface CreateResourceResponse {
  success: boolean;
  accessToken: string;
  user: UserRecord;
}
```

---

## `POST /auth/signin`

### Description

Sign-in response depends on user's last login time. If last login is less than 12 hours ago, status 201 will return with login response. If not, a verification code will be sent via email and status 200 will return.

#### Request Body

```typescript
interface SignInRequest {
  email: string;
  password: string;
}
```

#### Headers

- Content-Type: application/json

#### Responses

##### Status: 200 (Verification Required)

```typescript
interface VerificationResponse {
  success: boolean;
  verificationToken: string;
}
```

##### Status: 201 (Authentication Successful)

```typescript
interface AuthenticationResponse {
  success: boolean;
  accessToken: string;
  user: UserRecord;
}
```

---

## Error Responses

```typescript
interface ApiError {
  success: boolean;
  statusCode: string;
  message: string;
}
```

---

## Types

### User

```typescript
interface UserRecord {
  id: number;
  email: string;
  name: string;
  avatarUrl: string;
  createdAt: Date;
  permissions: string[];
}
```
