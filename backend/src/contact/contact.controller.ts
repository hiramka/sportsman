import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(@Body() body: { name: string; email: string; subject: string; message: string }) {
    if (!body.name || !body.email || !body.message) {
      throw new Error('Name, email, and message are required.');
    }
    const message = await this.contactService.create(body);
    return {
      success: true,
      message: 'Contact message saved successfully.',
      data: message,
    };
  }

  @Get()
  async findAll() {
    return await this.contactService.findAll();
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return await this.contactService.updateStatus(id, status);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.contactService.remove(id);
    return { success: true, message: 'Message deleted' };
  }
}
