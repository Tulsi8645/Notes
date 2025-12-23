import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);

        if (user) {
            // If user exists but has no password, they likely used OAuth
            if (!user.password) {
                const providers = user.authProviders.map(p => p.provider);
                if (providers.length > 0) {
                    throw new UnauthorizedException(
                        `This account uses social login (${providers.join(' and ')}). Please sign in with your existing social account.`
                    );
                }
            }

            if (user.password && (await bcrypt.compare(pass, user.password))) {
                const { password, ...result } = (user as any).toObject();
                return result;
            }
        }
        return null;
    }


    async login(user: any) {
        const payload = { email: user.email, sub: user._id };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }

    async validateOAuthUser(profile: any) {
        const { email, provider, providerId, username, picture } = profile;

        // 1. Check if user exists by provider
        let user = await this.usersService.findByProvider(provider, providerId);

        if (user) {
            // Update profile image if it changed
            if (picture && user.profileImage !== picture) {
                user.profileImage = picture;
                await user.save();
            }
            return (user as any).toObject();
        }

        // 2. Check if user exists by email (account linking)
        user = await this.usersService.findOneByEmail(email);

        if (user) {
            // Link provider and update profile image if missing
            await this.usersService.addAuthProvider((user._id as any).toString(), provider, providerId);
            if (picture && !user.profileImage) {
                user.profileImage = picture;
                await user.save();
            }
            return (user as any).toObject();
        }

        // 3. Create new user
        const newUser = await this.usersService.create({
            email,
            username: username || email.split('@')[0],
            profileImage: picture,
            authProviders: [{ provider, providerId }],
        });

        return (newUser as any).toObject();
    }
}

