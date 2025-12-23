import { Controller, Post, UseGuards, Request, Get, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard, GoogleAuthGuard, GithubAuthGuard, JwtAuthGuard } from './guards/auth.guards';
import { UsersService } from '../users/users.service';
import * as express from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        private configService: ConfigService,
    ) { }

    @Post('signup')
    async signup(@Body() createUserDto: any) {
        const user = await this.usersService.create(createUserDto);
        return this.authService.login(user);
    }


    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req: any) {
        return this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req: any) {
        return this.usersService.findById(req.user.userId);
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@Request() req: any) { }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleAuthRedirect(@Request() req: any, @Res() res: express.Response) {
        const user = await this.authService.validateOAuthUser(req.user);
        const { access_token } = await this.authService.login(user);
        const frontendUrl = this.configService.get('FRONTEND_URL');

        return res.redirect(`${frontendUrl}/login?token=${access_token}&user=${encodeURIComponent(JSON.stringify(user))}`);
    }

    @Get('github')
    @UseGuards(GithubAuthGuard)
    async githubAuth(@Request() req: any) { }

    @Get('github/callback')
    @UseGuards(GithubAuthGuard)
    async githubAuthRedirect(@Request() req: any, @Res() res: express.Response) {
        const user = await this.authService.validateOAuthUser(req.user);
        const { access_token } = await this.authService.login(user);
        const frontendUrl = this.configService.get('FRONTEND_URL');

        return res.redirect(`${frontendUrl}/login?token=${access_token}&user=${encodeURIComponent(JSON.stringify(user))}`);
    }
}


