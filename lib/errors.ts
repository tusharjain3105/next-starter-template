import { DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";
import { HttpStatusCode } from "./enums";

export class AuthenticationError extends Error {
  constructor(message = "You are not authorized to perform this transaction") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class ActionError extends Error {
  code?: number;
  constructor(
    message: string,
    code: HttpStatusCode | keyof typeof HttpStatusCode = 500,
  ) {
    const name = typeof code === "string" ? code : HttpStatusCode[code];
    const statusCode = typeof code !== "string" ? code : HttpStatusCode[code];
    message ||= name;
    super(message);
    this.name = name;
    this.code = statusCode;
  }
}

export class NotImplementedError extends ActionError {
  constructor(message: string = "This method is not implemented.") {
    super(message);
    this.name = "NotImplementedError";
    Object.setPrototypeOf(this, NotImplementedError.prototype);
  }
}

export class ServerError extends Error {
  constructor(message: string = DEFAULT_SERVER_ERROR_MESSAGE) {
    super(message);
    this.name = "ServerError";
    Object.setPrototypeOf(this, NotImplementedError.prototype);
  }
}
