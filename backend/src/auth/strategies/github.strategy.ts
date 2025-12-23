import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(configService: ConfigService) {
        console.log('GitHub Client ID:', configService.get('GITHUB_CLIENT_ID'));
        super({
            clientID: configService.get<string>('GITHUB_CLIENT_ID'),
            clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
            callbackURL: `${configService.get<string>('BACKEND_URL')}/auth/github/callback`,
            scope: ['user:email'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: any): Promise<any> {
        const { username, emails, photos } = profile;
        const user = {
            email: emails[0].value,
            username: username,
            picture: photos[0].value,
            accessToken,
            provider: 'github',
            providerId: profile.id,
        };
        done(null, user);
    }
}
