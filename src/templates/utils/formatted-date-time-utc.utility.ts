import { MONTHS } from '#/constants/date.constants';

export class FormattedDateTimeUTC {
  public day: string;
  public month: string;
  public year: number;
  public hours: string;
  public minutes: string;

  constructor({ time }: { time: Date }) {
    this.day = String(time.getUTCDate()).padStart(2, '0');
    this.month = MONTHS[time.getUTCMonth()];
    this.year = time.getUTCFullYear();
    this.hours = String(time.getUTCHours()).padStart(2, '0');
    this.minutes = String(time.getUTCMinutes()).padStart(2, '0');
  }

  toString(): string {
    return `${this.day} ${this.month} ${this.year}, ${this.hours}:${this.minutes} UTC`;
  }
}
