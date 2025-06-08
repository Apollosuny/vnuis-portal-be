import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type, Transform } from 'class-transformer'
import { RoomTimeSlot } from '@prisma/client'
import { RoomEntity } from '@app/room/entities/room.entity'
import { decodeDowsBit } from '../utils/decode-dows-bit'

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
  @ApiProperty({ description: 'Formatted start time (HH:MM) in UTC' })
  @Transform(({ obj }) => {
    const date = obj.startTime instanceof Date ? obj.startTime : new Date(obj.startTime)
    return `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`
  })
  get formattedStartTime(): string {
    const date = this.startTime instanceof Date ? this.startTime : new Date(this.startTime)
    return `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`
  }

  @Expose()
  @ApiProperty({ description: 'Formatted end time (HH:MM) in UTC' })
  @Transform(({ obj }) => {
    const date = obj.endTime instanceof Date ? obj.endTime : new Date(obj.endTime)
    return `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`
  })
  get formattedEndTime(): string {
    const date = this.endTime instanceof Date ? this.endTime : new Date(this.endTime)
    return `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`
  }

  @Expose()
  @ApiProperty()
  dowsBit: number

  @Expose()
  @ApiProperty()
  roomId: string

  // Thêm trường dows - được giải mã từ dowsBit
  @Expose()
  @ApiProperty({ description: 'Days of week', type: [String] })
  @Transform(({ obj }) => decodeDowsBit(obj.dowsBit))
  get dows(): string[] {
    return decodeDowsBit(this.dowsBit)
  }

  // Relations
  @ApiProperty({ type: () => RoomEntity })
  @Type(() => RoomEntity)
  @Expose()
  room?: RoomEntity
}
