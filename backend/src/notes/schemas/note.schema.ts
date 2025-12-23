import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema({ timestamps: true })
export class Note extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    author: User | Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
