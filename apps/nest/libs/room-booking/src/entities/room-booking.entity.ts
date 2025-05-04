import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { RoomBooking, RoomBookingStatus } from '@prisma/client'
import { StudentEntity } from '@app/student/entities/student.entity'
import { OperatorEntity } from '@app/operator/entities/operator.entity'
import { RoomEntity } from '@app/room/entities/room.entity'
import { RecurringPatternEntity } from '@app/recurring-pattern/entities/recurring-pattern.entity'

export class RoomBookingEntity implements RoomBooking {
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
  duration: number

  @Expose()
  @ApiProperty()
  purpose: string

  @Expose()
  @ApiProperty({ required: false })
  handleAt: Date | null

  @Expose()
  @ApiProperty({ required: false })
  remarks: string | null

  @Expose()
  @ApiProperty({ required: false })
  attendees: number | null

  @Expose()
  @ApiProperty()
  isRecurring: boolean

  @Expose()
  @ApiProperty({ enum: RoomBookingStatus })
  status: RoomBookingStatus

  @Expose()
  @ApiProperty()
  roomId: string

  @Expose()
  @ApiProperty()
  studentId: string

  @Expose()
  @ApiProperty({ required: false })
  handleByOperatorId: string | null

  // Relations
  @ApiProperty({ type: () => RoomEntity })
  @Type(() => RoomEntity)
  @Expose()
  room?: RoomEntity

  @ApiProperty({ type: () => StudentEntity })
  @Type(() => StudentEntity)
  @Expose()
  student?: StudentEntity

  @ApiProperty({ type: () => OperatorEntity, required: false })
  @Type(() => OperatorEntity)
  @Expose()
  handleBy?: OperatorEntity

  @ApiProperty({ type: () => RecurringPatternEntity, required: false })
  @Type(() => RecurringPatternEntity)
  @Expose()
  recurringPattern?: RecurringPatternEntity
}
