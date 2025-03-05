import { FileValidator, MaxFileSizeValidatorOptions } from '@nestjs/common';

export class UploadFileSizeValidator extends FileValidator<
  MaxFileSizeValidatorOptions,
  Express.Multer.File
> {
  private maxSize: number;

  constructor(
    protected readonly validationOptions: MaxFileSizeValidatorOptions,
  ) {
    super(validationOptions);
    this.maxSize = validationOptions.maxSize;
  }

  public isValid(
    file?:
      | Express.Multer.File
      | Express.Multer.File[]
      | Record<string, Express.Multer.File[]>,
  ): boolean {
    if (!file) {
      return false;
    }

    if (Array.isArray(file)) {
      return file.every((f) => this.validateFile(f));
    }
    if (typeof file === 'object' && 'size' in file) {
      return this.validateFile(file as Express.Multer.File);
    }

    let isFilesValid = false;
    for (const fileField in file) {
      const files = file[fileField];
      isFilesValid = files.every((f) => this.validateFile(f));
    }

    return isFilesValid;
  }

  public buildErrorMessage(): string {
    return `Validation failed (expected size is less than ${this.maxSize})`;
  }

  private validateFile(file: Express.Multer.File) {
    return 'size' in file && file.size < this.maxSize;
  }
}
