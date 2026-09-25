import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from '../entities/ContactMessage.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactRepository: Repository<ContactMessage>,
  ) {}

  async create(data: { name: string; email: string; subject: string; message: string }): Promise<ContactMessage> {
    const newMessage = this.contactRepository.create({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      status: 'unread',
    });
    return await this.contactRepository.save(newMessage);
  }

  async findAll(): Promise<ContactMessage[]> {
    return await this.contactRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: string): Promise<ContactMessage> {
    const msg = await this.contactRepository.findOne({ where: { id } });
    if (!msg) {
      throw new NotFoundException('Contact message not found');
    }
    msg.status = status;
    return await this.contactRepository.save(msg);
  }

  async remove(id: string): Promise<void> {
    const msg = await this.contactRepository.findOne({ where: { id } });
    if (!msg) {
      throw new NotFoundException('Contact message not found');
    }
    await this.contactRepository.remove(msg);
  }
}
