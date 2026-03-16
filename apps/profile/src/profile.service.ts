import { ProfileRepository } from './repositories/profile.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  getHello(): string {
    return 'Hello World!';
  }
}
