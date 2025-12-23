import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ unique: true, required: true })
    email: string;

    @Prop()
    username: string;

    @Prop({ select: false })
    password?: string;

    @Prop()
    profileImage?: string;

    @Prop({
        type: [{
            provider: String,
            providerId: String,
        }],
        default: [],
    })
    authProviders: { provider: string; providerId: string }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
