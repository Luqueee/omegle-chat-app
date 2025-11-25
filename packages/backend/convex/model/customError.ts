export interface CustomErrorProps {
  name?: string;
  message: string;
}

export interface CustomErrorResponse {
  name: string;
  message: string;
}

class CustomError extends Error {
  constructor(props: CustomErrorProps) {
    super(props.message);

    this.name = props?.name || 'CustomError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }

  public get message(): string {
    return super.message;
  }

  public response(): CustomErrorResponse {
    return {
      name: this.name,
      message: this.message,
    };
  }

  public static normalizeError(error: unknown): CustomError {
    if (error instanceof CustomError) {
      return error;
    }

    if (error instanceof Error) {
      return new CustomError({ message: error.message });
    }

    return new CustomError({ message: String(error) });
  }

  public static badRequest(message: string): CustomError {
    return new CustomError({ message });
  }

  public static unauthorized(message: string = 'Unauthorized'): CustomError {
    return new CustomError({ message });
  }

  public static forbidden(message: string = 'Forbidden'): CustomError {
    return new CustomError({ message });
  }

  public static notFound(message: string = 'Not found'): CustomError {
    return new CustomError({ message });
  }

  public static conflict(message: string): CustomError {
    return new CustomError({ message });
  }

  public static validation(message: string): CustomError {
    return new CustomError({ message });
  }

  public static internal(message: string = 'Internal server error'): CustomError {
    return new CustomError({ message });
  }
}

export default CustomError;
