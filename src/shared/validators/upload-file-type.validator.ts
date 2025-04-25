import { FileValidator } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fileType = require('file-type-mime');

interface UploadFileTypeValidatorOptions {
  fileType: string[];
}

export class UploadFileTypeValidator extends FileValidator<
  UploadFileTypeValidatorOptions,
  Express.Multer.File
> {
  private allowedMimeTypes: string[];

  constructor(
    protected readonly validationOptions: UploadFileTypeValidatorOptions,
  ) {
    super(validationOptions);
    this.allowedMimeTypes = this.validationOptions.fileType;
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
    if (typeof file === 'object' && 'buffer' in file) {
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
    return `Upload not allowed. Upload only files of type: ${this.allowedMimeTypes.join(
      ', ',
    )}`;
  }

  private validateFile(file: Express.Multer.File) {
    const response = fileType.parse(file.buffer);
    if (!response) {
      return false;
    }

    return this.allowedMimeTypes.includes(response.mime);
  }
}
