import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateRoomDto } from './dtos/create-room.dto'
import { UpdateRoomDto } from './dtos/update-room.dto'
import { QueryRoomDto } from './dtos/query-room.dto'
import { User } from '@prisma/client'
import { th } from '@app/helper/transform.helper'
import { RoomEntity } from './entities/room.entity'
import { RoomTimeSlotEntity } from '@app/room-time-slot/entities/room-time-slot.entity'

@Injectable()
export class RoomService {
  constructor(private readonly _prisma: PrismaService) {}

  async getRooms(queryRoomDto: QueryRoomDto) {
    const { select, include } = queryRoomDto
    const rooms = await this._prisma.room.findMany({
      where: queryRoomDto.where,
      orderBy: queryRoomDto.sort,
      take: queryRoomDto.take,
      skip: queryRoomDto.skip,
      ...(select
        ? { select: Object.fromEntries(select.map((key) => [key, true])) }
        : include
          ? { include: Object.fromEntries(include.map((key) => [key, true])) }
          : {}),
    })
    return th.toInstancesSafe(RoomEntity, rooms)
  }

  async getRoom(roomId: string) {
    return await this.findRoomWithIncludes(roomId, false, false)
  }

  async getRoomWithTimeSlots(roomId: string) {
    return await this.findRoomWithIncludes(roomId, true, false)
  }

  async getRoomWithDetails(roomId: string, includeTimeSlots: boolean, includeBookings: boolean) {
    return await this.findRoomWithIncludes(roomId, includeTimeSlots, includeBookings)
  }

  async getRoomWithTimeSlotsForToday(roomId: string) {
    const today = new Date()
    const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][today.getDay()]

    const room = await this._prisma.room.findUniqueOrThrow({
      where: { roomId },
      include: {
        timeSlots: true,
      },
    })

    if (room.timeSlots) {
      const { timeSlots } = room
      const timeSlotEntities = th.toInstancesSafe(RoomTimeSlotEntity, timeSlots)
      room.timeSlots = timeSlotEntities.filter((slot) => {
        return slot.dows.includes(dayOfWeek)
      })
    }

    return th.toInstanceSafe(RoomEntity, room)
  }

  // Helper method để giảm trùng lặp code
  private async findRoomWithIncludes(roomId: string, includeTimeSlots: boolean, includeBookings: boolean) {
    const room = await this._prisma.room.findUniqueOrThrow({
      where: { roomId },
      include: {
        timeSlots: includeTimeSlots,
        bookings: includeBookings,
      },
    })
    return th.toInstanceSafe(RoomEntity, room)
  }

  async createRoom(dto: CreateRoomDto, user: User) {
    const room = await this._prisma.room.create({
      data: {
        ...dto,
        // Link to user's profile if needed
        // profileId: user.profileId,
      },
    })
    return th.toInstanceSafe(RoomEntity, room)
  }

  async updateRoom(roomId: string, dto: UpdateRoomDto, user: User) {
    const room = await this._prisma.room.update({
      where: {
        roomId,
        // Add additional profile check if needed
        // profileId: user.profileId
      },
      data: dto,
    })
    return th.toInstanceSafe(RoomEntity, room)
  }

  async deleteRoom(roomId: string, user: User) {
    return await this._prisma.room.delete({
      where: {
        roomId,
        // Add additional profile check if needed
        // profileId: user.profileId
      },
    })
  }
}
