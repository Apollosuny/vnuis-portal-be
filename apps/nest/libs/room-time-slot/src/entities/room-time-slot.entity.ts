import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { RoomTimeSlot } from '@prisma/client'
import { RoomEntity } from '@app/room/entities/room.entity'

export class RoomTimeSlotEntity implements RoomTimeSlot {
  @Expose()
  @ApiProperty()
  id: string

  @Expose()
  @ApiProperty()
  createdAt: Date

  @Expose()
  @ApiProperty()
  updatedAt: Date

  @Expose()
  @ApiProperty()
  startTime: Date

  @Expose()
  @ApiProperty()
  endTime: Date

  @Expose()
  @ApiProperty()
  dowsBit: number

  @Expose()
  @ApiProperty()
  roomId: string

  // Relations
  @ApiProperty({ type: () => RoomEntity })
  @Type(() => RoomEntity)
  @Expose()
  room?: RoomEntity
}
