import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  async create(userData: Partial<User>): Promise<User> {
    const { email, password, ...rest } = userData;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      const providers = existingUser.authProviders.map(p => p.provider);
      if (providers.length > 0) {
        throw new ConflictException(
          `This email is already associated with ${providers.join(' and ')}. Please sign in using your existing social account.`
        );
      }
      throw new ConflictException('This email is already registered. Please sign in with your password.');
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const newUser = new this.userModel({
      email,
      ...rest,
      password: hashedPassword,
    });
    return newUser.save();
  }


  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findByProvider(provider: string, providerId: string): Promise<User | null> {
    return this.userModel.findOne({
      'authProviders.provider': provider,
      'authProviders.providerId': providerId,
    }).exec();
  }

  async addAuthProvider(userId: string, provider: string, providerId: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $push: { authProviders: { provider, providerId } } },
      { new: true },
    ).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }
}

