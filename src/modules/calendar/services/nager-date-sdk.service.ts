import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ApiConfigService } from 'src/config/api-config.service';
import { z } from 'zod';

// Zod Schemas for Validation
const HolidaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  localName: z.string(),
  name: z.string(),
  countryCode: z.string().length(2),
  fixed: z.boolean(),
  global: z.boolean(),
  counties: z.array(z.string()).nullable(),
  launchYear: z.number().nullable(),
  types: z.array(z.string()),
});

const CountrySchema = z.object({
  countryCode: z.string().length(2),
  name: z.string(),
});

// SDK Class
@Injectable()
export class NagerDateSDK {
  private api: AxiosInstance;

  constructor(cs: ApiConfigService) {
    this.api = axios.create({
      baseURL: cs.getApp().nagerUrl,
    });
  }

  private async fetch<T>(url: string, schema: z.ZodSchema<T>): Promise<T> {
    try {
      const response = await this.api.get(url);
      return schema.parse(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch from ${url}: ${error}`);
    }
  }

  /** Get public holidays for a specific year and country */
  async getPublicHolidays(year: number, countryCode: string) {
    const url = `/PublicHolidays/${year}/${countryCode}`;
    return this.fetch(url, z.array(HolidaySchema));
  }

  /** Get all supported countries */
  async getAvailableCountries() {
    const url = `/AvailableCountries`;
    return this.fetch(url, z.array(CountrySchema));
  }

  /** Get if a specific day is a public holiday in a country */
  async isPublicHoliday(date: string, countryCode: string) {
    const url = `/IsPublicHoliday/${date}/${countryCode}`;
    return this.fetch(url, z.boolean());
  }
}
