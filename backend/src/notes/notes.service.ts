import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note } from './schemas/note.schema';

@Injectable()
export class NotesService {
  constructor(@InjectModel(Note.name) private noteModel: Model<Note>) { }

  async create(userId: string, createNoteDto: any): Promise<Note> {
    const newNote = new this.noteModel({
      ...createNoteDto,
      author: new Types.ObjectId(userId),
    });
    return newNote.save();
  }

  async findAll(userId: string): Promise<Note[]> {
    return this.noteModel.find({ author: new Types.ObjectId(userId) }).exec();
  }

  async findOne(userId: string, id: string): Promise<Note> {
    const note = await this.noteModel.findOne({
      _id: new Types.ObjectId(id),
      author: new Types.ObjectId(userId),
    }).exec();
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }

  async update(userId: string, id: string, updateNoteDto: any): Promise<Note> {
    const note = await this.noteModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), author: new Types.ObjectId(userId) },
      updateNoteDto,
      { new: true },
    ).exec();
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.noteModel.deleteOne({
      _id: new Types.ObjectId(id),
      author: new Types.ObjectId(userId),
    }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Note not found');
    }
  }
}
