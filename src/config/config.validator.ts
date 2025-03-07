import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export class ConfigValidator {
  static validate<T extends object>(
    config: Record<string, unknown>,
    Class: ClassConstructor<T>,
  ) {
    const validatedConfig = plainToInstance(Class, config, {
      enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      throw new Error(errors.toString());
    }

    return validatedConfig;
  }
}
