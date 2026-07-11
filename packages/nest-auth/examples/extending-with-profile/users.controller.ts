// examples/extending-with-profile/users.controller.ts
//
// This is YOUR OWN controller — separate from the package's built-in
// /auth/register endpoint. Point your frontend's register form at THIS
// endpoint instead, so extra fields get saved alongside the auth account.

import { Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '@mahbub508/nest-auth';
import { UserProfile } from './user-profile.entity';
import { RegisterWithProfileDto } from './register-with-profile.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly authService: AuthService, // from @mahbub508/nest-auth
    @InjectRepository(UserProfile)
    private readonly profileRepo: Repository<UserProfile>,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterWithProfileDto) {
    // 1. Let the package handle account creation, password hashing,
    //    and sending the verification OTP — same as always.
    const result = await this.authService.register({
      email: dto.email,
      password: dto.password,
    });

    // 2. Now create YOUR profile row, linked to the new auth user's id.
    const profile = this.profileRepo.create({
      authUserId: result.userId,
      fullName: dto.fullName,
      phone: dto.phone,
    });
    await this.profileRepo.save(profile);

    return {
      success: true,
      message: result.message,
      userId: result.userId,
    };
  }
}

/*
Wire this into your AppModule alongside AuthModule.forRoot(...):

@Module({
  imports: [
    // ...TypeOrmModule.forRoot(...),
    TypeOrmModule.forFeature([UserProfile]),
    AuthModule.forRoot({ ... }),
  ],
  controllers: [UsersController],
})
export class AppModule {}

Your frontend should now call POST /users/register (this one) instead of
POST /auth/register (the package's built-in one) so the extra fields get
saved. The rest of the flow — /auth/verify-email, /auth/login,
/auth/forgot-password, /auth/reset-password — stays exactly the same,
since those don't need the extra fields.
*/
