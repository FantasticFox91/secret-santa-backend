import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class TaskSchedulerService {
  constructor(private readonly schedulerRegistry: SchedulerRegistry) {}

  addTimeoutJob(name: string, date: Date, callback: () => void) {
    const timeout = date.getTime() - Date.now();

    if (timeout > 0) {
      const timeoutRef = setTimeout(callback, timeout);
      this.schedulerRegistry.addTimeout(name, timeoutRef);
    }
  }

  addTimeoutJobTest(name: string, seconds: number, callback: () => void) {
    const timeout = seconds * 1000;

    const timeoutRef = setTimeout(callback, timeout);
    this.schedulerRegistry.addTimeout(name, timeoutRef);
  }
}
