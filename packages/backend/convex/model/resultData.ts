import CustomError, { type CustomErrorProps, type CustomErrorResponse } from './customError';

interface ResultDataResponse<T> {
  message?: string;
  data?: T;
  errors: CustomErrorResponse[];
  hasErrors: boolean;
}

class ResultData<T> {
  private messageValue?: string;
  private dataValue?: T;
  private errorsValue: CustomErrorResponse[];
  private hasErrorsValue: boolean;

  constructor() {
    this.errorsValue = [];
    this.hasErrorsValue = false;
  }

  public get message(): string | undefined {
    return this.messageValue;
  }

  public get data(): T | undefined {
    return this.dataValue;
  }

  public get errors(): CustomErrorResponse[] {
    return this.errorsValue;
  }

  public get hasErrors(): boolean {
    return this.hasErrorsValue;
  }

  public response(): ResultDataResponse<T> {
    return {
      message: this.messageValue,
      data: this.dataValue,
      errors: this.errorsValue,
      hasErrors: this.hasErrorsValue,
    };
  }

  public static create<T>(): ResultData<T> {
    return new ResultData<T>();
  }

  public addMessage(message: string): void {
    this.messageValue = message;
  }

  public addData(data: T): void {
    this.dataValue = data;
  }

  public addError(props: CustomErrorProps | CustomError): void {
    this.errorsValue.push(
      props instanceof CustomError ? props.response() : new CustomError(props).response()
    );
    this.hasErrorsValue = true;
  }

  public addErrors(errors: CustomError[]): void {
    this.errorsValue.push(...errors.map((error) => error.response()));
    this.hasErrorsValue = true;
  }
}

export default ResultData;
